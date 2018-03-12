/*
 *     Evelium - A matrix client
 *     Copyright (C)  2018 Travis Ralston
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { AuthenticatedApi, AuthenticatedApiAccess } from "./authenticated-api";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { SyncService } from "./sync.service";
import { Room } from "../../models/matrix/dto/room";
import { RoomEvent } from "../../models/matrix/events/room/room-event";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { SyncJoinedRoom, SyncResponse } from "../../models/matrix/http/sync";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { AngularIndexedDB } from "angular2-indexeddb/angular2-indexeddb";
import { RoomStateEvent } from "../../models/matrix/events/room/state/room-state-event";
import { ROOMS_DB } from "./databases";
import { EphemeralEvent } from "../../models/matrix/events/ephemeral/ephemeral-event";
import { RoomAccountDataEvent } from "../../models/matrix/events/account/room_account/room-account-data-event";
import { HomeserverService } from "./homeserver.service";
import { SendEventResponse } from "../../models/matrix/http/events";
import { Injectable } from "@angular/core";
import { AccountService } from "./account.service";
import { AccountDataEvent } from "../../models/matrix/events/account/account-data-event";
import { DirectChatsEventContent } from "../../models/matrix/events/account/m.direct";

const MAX_MEMORY_TIMELINE_SIZE = 150; // TODO: Configuration?

// For singleton access
let roomHandler: RoomHandler;

@Injectable()
export class RoomService extends AuthenticatedApi {

    constructor(http: HttpClient, auth: AuthService, private sync: SyncService, private account: AccountService, private hs: HomeserverService) {
        super(http, auth);
    }

    private checkHandler(): void {
        if (!roomHandler) roomHandler = new RoomHandler(this.http, this.auth, this.sync, this.account, this.hs);
    }

    public get joined(): Observable<Room> {
        this.checkHandler();
        return roomHandler.joined;
    }

    public getAll(): Promise<Room[]> {
        this.checkHandler();
        return roomHandler.getAllRooms();
    }

    public getById(roomId: string): Promise<Room> {
        this.checkHandler();
        return roomHandler.getRoomById(roomId);
    }
}

interface CachedRoom {
    obj: Room;
    timelineOut: Subject<RoomEvent>;
    pendingTimelineOut: Subject<RoomEvent[]>; // sends full timeline on each update
    lastPending: RoomEvent[];
}

class RoomHandler {

    /**
     * Observes when rooms are considered joined
     */
    public readonly joined: Observable<Room>;
    private joinedOut: Subject<Room>;

    private cache: { [roomId: string]: CachedRoom } = {};
    private api: AuthenticatedApiAccess;
    private db: AngularIndexedDB;
    private dbPromise: Promise<any>;

    constructor(http: HttpClient, auth: AuthService, sync: SyncService, account: AccountService, private hs: HomeserverService) {
        this.api = new AuthenticatedApiAccess(http, auth);

        const joinedObservable = new Subject<Room>();
        this.joined = joinedObservable;
        this.joinedOut = joinedObservable;

        this.dbPromise = this.loadFromDb().then(() => console.log("Loaded room information from database"));

        sync.stream.subscribe(response => this.processSync(response));
        account.accountData.events.subscribe(event => this.processDirectChats(event));

        account.accountData.get("m.direct")
            .then(e => this.processDirectChats(e)).catch(() => Promise.resolve()); // swallow errors
    }

    private async processSync(response: SyncResponse): Promise<any> {
        if (!response || !response.rooms || !response.rooms.join) return;
        console.log("Processing joined rooms from sync response");
        await this.dbPromise;

        for (const roomId in response.rooms.join) {
            const syncRoom: SyncJoinedRoom = response.rooms.join[roomId];

            let cachedRoom = this.cache[roomId];
            if (!cachedRoom) {
                const state = syncRoom.state && syncRoom.state.events ? syncRoom.state.events : [];
                cachedRoom = await this.prepareRoom(roomId, state);
                this.joinedOut.next(cachedRoom.obj);
            }

            await this.upsertRoom(cachedRoom.obj);

            if (syncRoom.timeline && syncRoom.timeline.events) {
                await this.addEventsToRoom(cachedRoom.obj, syncRoom.timeline.events);
                await this.storeBatch(cachedRoom.obj, syncRoom.timeline.events, syncRoom.timeline.prev_batch);
            }

            if (syncRoom.account_data && syncRoom.account_data.events) {
                syncRoom.account_data.events.forEach(e => this.upsertAccountData(cachedRoom.obj, e));
            }

            if (syncRoom.ephemeral && syncRoom.ephemeral.events) {
                syncRoom.ephemeral.events.forEach(e => this.upsertEdu(cachedRoom.obj, e));
            }
        }
    }

    private async processDirectChats(rawEvent: AccountDataEvent): Promise<any> {
        if (!rawEvent || rawEvent.type !== "m.direct") return;
        await this.dbPromise;

        const map = <DirectChatsEventContent>(rawEvent.content || {});
        const directRooms: string[] = [];

        for (const userId in map) {
            const rooms = map[userId];
            if (!rooms) continue;

            for (const roomId of rooms) {
                directRooms.push(roomId);
            }
        }

        for (const roomId in this.cache) {
            const cachedRoom = this.cache[roomId];
            cachedRoom.obj.isDirect = directRooms.indexOf(roomId) !== -1;
        }
    }

    public async getRoomById(roomId: string): Promise<Room> {
        await this.dbPromise;
        if (!this.cache[roomId]) return Promise.reject(new Error("Room not found"));
        return this.cache[roomId].obj;
    }

    public async getAllRooms(): Promise<Room[]> {
        await this.dbPromise;
        return Object.keys(this.cache).map(r => this.cache[r].obj);
    }

    private async prepareRoom(roomId: string, state: RoomStateEvent[]): Promise<CachedRoom> {
        const room = new Room(roomId, state);

        const pendingTimeline = new ReplaySubject<RoomEvent[]>(1);
        room.pendingTimeline = pendingTimeline;

        const timelineObservable = new ReplaySubject<RoomEvent>(MAX_MEMORY_TIMELINE_SIZE);
        const timelineObserver = {
            next: (data: RoomEvent) => {
                return this.sendEvent(room, data);
            },
        };
        room.timeline = Subject.create(timelineObserver, timelineObservable);

        const cachedRoom: CachedRoom = {
            obj: room,
            timelineOut: timelineObservable,
            pendingTimelineOut: pendingTimeline,
            lastPending: [],
        };
        this.cache[roomId] = cachedRoom;

        return Promise.resolve(cachedRoom);
    }

    private sendEvent(room: Room, event: RoomEvent): Promise<any> {
        event.event_id = "_PENDING_$" + new Date().getTime() + "-" + room.roomId + "-" + event.type + ":io.evelium.fake";

        const txnId = "evelium." + new Date().getTime();
        const url = `${this.hs.clientServerApi}/rooms/${room.roomId}/send/${event.type}/${txnId}`;

        const cachedRoom = this.cache[room.roomId];
        cachedRoom.lastPending.push(event);
        cachedRoom.pendingTimelineOut.next(cachedRoom.lastPending);

        return this.api.put<SendEventResponse>(url, event.content).toPromise().then(r => {
            const idx = cachedRoom.lastPending.indexOf(event);
            if (idx !== -1) cachedRoom.lastPending.splice(idx, 1);
            cachedRoom.pendingTimelineOut.next(cachedRoom.lastPending);

            event.event_id = r.event_id; // It should automatically end up on the timeline
        });
    }

    private addEventsToRoom(room: Room, events: RoomEvent[]): Promise<any> {
        const cachedRoom = this.cache[room.roomId];

        for (const event of events) {
            // See if we need to update state
            const stateEvent = <RoomStateEvent>event;
            if (stateEvent.state_key !== undefined) {
                // First remove the replaced state, if present
                if (stateEvent.unsigned && stateEvent.unsigned.replaces_state) {
                    const oldEvent = room.state.find(e => e.event_id === stateEvent.unsigned.replaces_state);
                    if (oldEvent) room.state.splice(room.state.indexOf(oldEvent), 1);
                }

                // Next remove anything that should be clobbered
                const toRemove = room.state.filter(e => e.type === stateEvent.type && e.state_key === stateEvent.state_key);
                toRemove.forEach(e => room.state.splice(room.state.indexOf(e), 1));

                // Finally push the new state
                room.state.push(stateEvent);
            }

            // Now process the event normally (add to timeline)
            cachedRoom.timelineOut.next(event);
        }

        return Promise.resolve();
    }

    private async storeBatch(room: Room, events: RoomEvent[], prevBatch: string): Promise<any> {
        await this.dbPromise;

        const dbRecord = {
            roomId: room.roomId,
            events: events,
            prevBatch: prevBatch,
        };

        return this.db.add("batches", dbRecord);

        // TODO: Trim batches for the room
    }

    private async upsertRoom(room: Room): Promise<any> {
        await this.dbPromise;

        const dbRecord = {
            roomId: room.roomId,
            state: room.state,
        };

        return this.db.getByKey("rooms", room.roomId).then(record => {
            if (record) return this.db.delete("rooms", room.roomId);
        }).then(() => this.db.add("rooms", dbRecord));
    }

    private async upsertAccountData(room: Room, event: RoomAccountDataEvent): Promise<any> {
        await this.dbPromise;

        const dbRecord = {
            roomId: room.roomId,
            eventType: event.type,
            content: event.content,
        };

        return this.db.getByKey("account_data", [room.roomId, event.type]).then(record => {
            if (record) return this.db.delete("account_data", [room.roomId, event.type]);
        }).then(() => this.db.add("account_data", dbRecord));
    }

    private async upsertEdu(room: Room, event: EphemeralEvent): Promise<any> {
        await this.dbPromise;

        const dbRecord = {
            roomId: room.roomId,
            eventType: event.type,
            content: event.content,
        };

        return this.db.getByKey("edus", [room.roomId, event.type]).then(record => {
            if (record) return this.db.delete("edus", [room.roomId, event.type]);
        }).then(() => this.db.add("edus", dbRecord));
    }

    private loadFromDb(): Promise<any> {
        this.db = new AngularIndexedDB(ROOMS_DB, 1);
        return this.db.openDatabase(1, evt => {
            evt.currentTarget.result.createObjectStore("batches", {
                keyPath: "id",
                autoIncrement: true,
            });
            // batches.createIndex("roomId", "roomId", {unique: false});
            // batches.createIndex("prevBatch", "prevBatch", {unique: false});
            // batches.createIndex("events", "events", {unique: false});

            evt.currentTarget.result.createObjectStore("rooms", {
                keyPath: "roomId",
            });
            // roomState.createIndex("roomId", "roomId", {unique: true});
            // roomState.createIndex("state", "state", {unique: false});

            evt.currentTarget.result.createObjectStore("edus", {
                keyPath: ["roomId", "eventType"],
            });
            // eduStore.createIndex("roomId", "roomId", {unique: false});
            // eduStore.createIndex("eventType", "eventType", {unique: false});
            // eduStore.createIndex("content", "content", {unique: false});

            evt.currentTarget.result.createObjectStore("account_data", {
                keyPath: ["roomId", "eventType"],
            });
            // accountData.createIndex("roomId", "roomId", {unique: false});
            // accountData.createIndex("eventType", "eventType", {unique: false});
            // accountData.createIndex("content", "content", {unique: false});
        }).then(() => {
            return this.db.getAll("rooms");
        }).then(records => {
            return Promise.all(records.map(r => {
                return this.prepareRoom(r.roomId, r.state).then(room => this.joinedOut.next(room.obj));
            }));
        }).then(() => {
            return this.db.getAll("batches");
        }).then(records => {
            return Promise.all(records.map(r => {
                const room = this.cache[r.roomId];
                return this.addEventsToRoom(room.obj, r.events);
            }));
        }).then(() => {
            // TODO: Load EDUs
            // TODO: Load Room Account Data
        });
    }
}