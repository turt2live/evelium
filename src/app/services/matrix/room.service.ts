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
import { ReadReceipts, Room } from "../../models/matrix/dto/room";
import { RoomEvent } from "../../models/matrix/events/room/room-event";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { SyncJoinedRoom, SyncResponse } from "../../models/matrix/http/sync";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { AngularIndexedDB } from "angular2-indexeddb/angular2-indexeddb";
import { RoomStateEvent } from "../../models/matrix/events/room/state/room-state-event";
import { ROOMS_DB } from "./databases";
import { RoomAccountDataEvent } from "../../models/matrix/events/account/room_account/room-account-data-event";
import { HomeserverService } from "./homeserver.service";
import { SendEventResponse } from "../../models/matrix/http/events";
import { Injectable } from "@angular/core";
import { AccountService } from "./account.service";
import { AccountDataEvent } from "../../models/matrix/events/account/account-data-event";
import { DirectChatsEventContent } from "../../models/matrix/events/account/m.direct";
import { EventTileService } from "../event-tile.service";
import { ReceiptEvent } from "../../models/matrix/events/ephemeral/m.receipt";
import { SendReceiptResponse } from "../../models/matrix/http/receipts";

const MAX_MEMORY_TIMELINE_SIZE = 150; // TODO: Configuration?

// For singleton access
let roomHandler: RoomHandler;

export interface UpdatedRoomTags {
    direct: Room[];
    other: Room[];

    // TODO: Handle real/custom tags like "Work"
}

@Injectable()
export class RoomService extends AuthenticatedApi {

    constructor(http: HttpClient, auth: AuthService, private sync: SyncService,
                private account: AccountService, private hs: HomeserverService,
                private tiles: EventTileService) {
        super(http, auth);
    }

    private checkHandler(): void {
        if (!roomHandler) roomHandler = new RoomHandler(this.http, this.auth, this.sync, this.account, this.hs, this.tiles);
    }

    public get joined(): Observable<Room> {
        this.checkHandler();
        return roomHandler.joined;
    }

    public get currentlyJoined(): Observable<Room[]> {
        this.checkHandler();
        return roomHandler.currentlyJoined;
    }

    public get left(): Observable<Room> {
        this.checkHandler();
        return roomHandler.left;
    }

    public get tagged(): Observable<UpdatedRoomTags> {
        this.checkHandler();
        return roomHandler.tagged;
    }

    public getAll(): Promise<Room[]> {
        this.checkHandler();
        return roomHandler.getAllRooms();
    }

    public getById(roomId: string): Promise<Room> {
        this.checkHandler();
        return roomHandler.getRoomById(roomId);
    }

    public sendReadReceipt(room: Room): Promise<any> {
        this.checkHandler();
        return roomHandler.sendReadReceipt(room);
    }
}

interface ReadReceiptMap {
    [userId: string]: {
        eventId: string;
        timestamp: number;
    };
}

interface CachedRoom {
    obj: Room;
    timelineEvents: { event: RoomEvent, renderable: boolean }[];
    timelineOut: Subject<RoomEvent>;
    pendingTimelineOut: Subject<RoomEvent[]>; // sends full timeline on each update
    readReceiptsOut: Subject<ReadReceipts>; // replay
    lastPending: RoomEvent[];
    lastReadReceipts: ReadReceiptMap;
}

class RoomHandler {

    /**
     * Observable view of the joined rooms
     */
    public readonly joined: Observable<Room>;
    private joinedOut: Subject<Room>;

    /**
     * Observable view of the currently joined rooms (replay)
     */
    public readonly currentlyJoined: Observable<Room[]>;
    private currentlyJoinedOut: Subject<Room[]>;

    /**
     * Observable stream for when rooms are left
     */
    public readonly left: Observable<Room>;
    private leftOut: Subject<Room>;

    /**
     * Observable view of the tagged rooms
     */
    public readonly tagged: Observable<UpdatedRoomTags>;
    private taggedOut: Subject<UpdatedRoomTags>;

    private cache: { [roomId: string]: CachedRoom } = {};
    private directChatIds: string[] = [];
    private api: AuthenticatedApiAccess;
    private db: AngularIndexedDB;
    private dbPromise: Promise<any>;

    constructor(http: HttpClient, private auth: AuthService, sync: SyncService, account: AccountService,
                private hs: HomeserverService, private tiles: EventTileService) {
        this.api = new AuthenticatedApiAccess(http, auth);

        const joinedObservable = new Subject<Room>();
        this.joined = joinedObservable;
        this.joinedOut = joinedObservable;

        const currentlyJoinedObservable = new ReplaySubject<Room[]>(1);
        this.currentlyJoined = currentlyJoinedObservable;
        this.currentlyJoinedOut = currentlyJoinedObservable;

        const leftObservable = new Subject<Room>();
        this.left = leftObservable;
        this.leftOut = leftObservable;

        const taggedObservable = new ReplaySubject<UpdatedRoomTags>(1);
        this.tagged = taggedObservable;
        this.taggedOut = taggedObservable;

        this.dbPromise = this.loadFromDb().then(() => console.log("Loaded room information from database"));

        sync.stream.subscribe(response => this.processSync(response));
        account.accountData.events.subscribe(event => this.processDirectChats(event));

        account.accountData.get("m.direct")
            .then(e => this.processDirectChats(e)).catch(() => Promise.resolve()); // swallow errors
    }

    private async processSync(response: SyncResponse): Promise<any> {
        if (!response || !response.rooms) return;
        await this.dbPromise;

        if (response.rooms.join) this.processJoinedRooms(response);
        if (response.rooms.leave) this.processLeftRooms(response);
    }

    private async processLeftRooms(response: SyncResponse): Promise<any> {
        console.log("Processing left rooms from sync response");

        let updateJoinedRooms: boolean;
        for (const roomId in response.rooms.leave) {
            const cachedRoom = this.cache[roomId];
            if (!cachedRoom) continue; // Only need to delete if we're actually leaving

            this.deleteRoom(cachedRoom.obj); // let this go async
            this.leftOut.next(cachedRoom.obj);
            updateJoinedRooms = true;
        }

        if (updateJoinedRooms) this.updateJoinedRooms();
    }

    private async processJoinedRooms(response: SyncResponse): Promise<any> {
        console.log("Processing joined rooms from sync response");

        let updateJoinedRooms = false;
        for (const roomId in response.rooms.join) {
            const syncRoom: SyncJoinedRoom = response.rooms.join[roomId];

            let cachedRoom = this.cache[roomId];
            if (!cachedRoom) {
                const state = syncRoom.state && syncRoom.state.events ? syncRoom.state.events : [];
                cachedRoom = await this.prepareRoom(roomId, state);
                this.joinedOut.next(cachedRoom.obj);
                updateJoinedRooms = true;
            }

            await this.upsertRoom(cachedRoom.obj);
            const updatedReadReceipts: ReadReceiptMap = {};

            if (syncRoom.timeline && syncRoom.timeline.events && syncRoom.timeline.events.length > 0) {
                const readReceipts = await this.addEventsToRoom(cachedRoom.obj, syncRoom.timeline.events);
                await this.storeBatch(cachedRoom.obj, syncRoom.timeline.events, syncRoom.timeline.prev_batch);

                // Copy read receipts into our sync copy for handling
                for (const userId in readReceipts) {
                    updatedReadReceipts[userId] = readReceipts[userId];
                }
            }

            if (syncRoom.account_data && syncRoom.account_data.events) {
                syncRoom.account_data.events.forEach(e => this.upsertAccountData(cachedRoom.obj, e));
            }

            if (syncRoom.ephemeral && syncRoom.ephemeral.events) {
                syncRoom.ephemeral.events.forEach(event => {
                    if (event.type !== "m.receipt") {
                        console.warn("Skipping ephemeral event of type " + event.type + " in " + roomId);
                        return;
                    }

                    const receiptEvent = <ReceiptEvent>event;
                    Object.keys(receiptEvent.content).forEach(eventId => {
                        const eventReceipts = receiptEvent.content[eventId];
                        if (!eventReceipts["m.read"]) {
                            console.warn("m.receipt in " + roomId + " does not have an m.read");
                            return;
                        }

                        Object.keys(eventReceipts["m.read"]).forEach(userId => {
                            const ts = eventReceipts["m.read"][userId]["ts"] || new Date().getTime();

                            let updateMemoryReceipt = true;
                            const currentReceipt = cachedRoom.lastReadReceipts[userId];
                            if (currentReceipt) {
                                const currentEventIndex = cachedRoom.timelineEvents.findIndex(e => e.event.event_id === currentReceipt.eventId);
                                const targetEventIndex = cachedRoom.timelineEvents.findIndex(e => e.event.event_id === eventId);
                                if (targetEventIndex < currentEventIndex) {
                                    // Skip read receipt - we have a newer one already stored
                                    updateMemoryReceipt = false;
                                }
                            }

                            if (updateMemoryReceipt) {
                                updatedReadReceipts[userId] = {
                                    eventId: eventId,
                                    timestamp: ts,
                                };
                            }

                            return this.upsertReadReceipt(cachedRoom.obj, eventId, userId, ts);
                        });
                    });
                });

                // Create a new map for read receipts
                const userIds = Object.keys(updatedReadReceipts);
                if (userIds.length > 0) {
                    userIds.forEach(u => cachedRoom.lastReadReceipts[u] = updatedReadReceipts[u]);
                    this.calculateNewReadReceipts(cachedRoom);
                }
            }
        }

        if (updateJoinedRooms) this.updateJoinedRooms();
    }

    private calculateNewReadReceipts(cachedRoom: CachedRoom) {
        const newMap: ReadReceipts = {};
        for (const userId in cachedRoom.lastReadReceipts) {
            const rr = cachedRoom.lastReadReceipts[userId];

            let eventIndex = cachedRoom.timelineEvents.findIndex(e => e.event.event_id === rr.eventId);
            if (eventIndex === -1) {
                // Try and find the most recent event we can slap a read receipt on
                for (let i = cachedRoom.timelineEvents.length - 1; i > 0; i--) {
                    const event = cachedRoom.timelineEvents[i];
                    if (event.renderable && event.event.origin_server_ts <= rr.timestamp) {
                        eventIndex = i;
                        break;
                    }
                }
            }

            while (eventIndex >= 0 && !cachedRoom.timelineEvents[eventIndex].renderable) eventIndex--;
            if (eventIndex < 0) continue;

            if (!newMap[rr.eventId]) newMap[rr.eventId] = [];
            newMap[rr.eventId].push({userId: userId, timestamp: rr.timestamp});
        }

        cachedRoom.readReceiptsOut.next(newMap);
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

        this.directChatIds = directRooms;

        const tagMap: UpdatedRoomTags = {
            direct: [],
            other: [],
        };

        for (const roomId in this.cache) {
            const cachedRoom = this.cache[roomId];
            cachedRoom.obj.isDirect = directRooms.indexOf(roomId) !== -1;

            if (cachedRoom.obj.isDirect) tagMap.direct.push(cachedRoom.obj);
            else tagMap.other.push(cachedRoom.obj);
        }

        this.taggedOut.next(tagMap);
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

    private updateJoinedRooms() {
        const joined: Room[] = [];
        for (const roomId in this.cache) {
            joined.push(this.cache[roomId].obj);
        }

        this.currentlyJoinedOut.next(joined);
    }

    private async prepareRoom(roomId: string, state: RoomStateEvent[]): Promise<CachedRoom> {
        const room = new Room(roomId, state);

        const pendingTimeline = new ReplaySubject<RoomEvent[]>(1);
        room.pendingTimeline = pendingTimeline;
        room.isDirect = this.directChatIds.indexOf(roomId) !== -1;

        const timelineObservable = new ReplaySubject<RoomEvent>(MAX_MEMORY_TIMELINE_SIZE);
        const timelineObserver = {
            next: (data: RoomEvent) => {
                return this.sendEvent(room, data);
            },
        };
        room.timeline = Subject.create(timelineObserver, timelineObservable);

        const readReceiptsObservable = new ReplaySubject<ReadReceipts>(1);
        room.readReceipts = readReceiptsObservable;

        const cachedRoom: CachedRoom = {
            obj: room,
            timelineEvents: [],
            timelineOut: timelineObservable,
            pendingTimelineOut: pendingTimeline,
            readReceiptsOut: readReceiptsObservable,
            lastPending: [],
            lastReadReceipts: {},
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

    public sendReadReceipt(room: Room): Promise<any> {
        const cachedRoom = this.cache[room.roomId];
        const lastReadReceipt = cachedRoom.lastReadReceipts[this.auth.userId];
        const lastEvent = cachedRoom.timelineEvents[cachedRoom.timelineEvents.length - 1];
        if (lastReadReceipt.eventId === lastEvent.event.event_id) return Promise.resolve();

        cachedRoom.lastReadReceipts[this.auth.userId] = {
            eventId: lastEvent.event.event_id,
            timestamp: new Date().getTime()
        };
        this.calculateNewReadReceipts(cachedRoom);

        const url = `${this.hs.clientServerApi}/rooms/${room.roomId}/receipt/m.read/${lastEvent.event.event_id}`;
        return this.api.post<SendReceiptResponse>(url, {}).toPromise().catch(err => {
            console.error(err);
            cachedRoom.lastReadReceipts[this.auth.userId] = lastReadReceipt;
            this.calculateNewReadReceipts(cachedRoom);
        });
    }

    private addEventsToRoom(room: Room, events: RoomEvent[]): Promise<ReadReceiptMap> {
        const cachedRoom = this.cache[room.roomId];
        const updatedReadReceipts: ReadReceiptMap = {};

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

            // Now process the event normally (add to timeline), assuming we can render it
            const renderable = this.tiles.isRenderable(event);
            cachedRoom.timelineEvents.push({event: event, renderable: renderable});
            if (this.tiles.isRenderable(event)) cachedRoom.timelineOut.next(event);
            else console.warn("Event of type '" + event.type + "' is not renderable");

            // Don't forget to send a read receipt for the event
            updatedReadReceipts[event.sender] = {eventId: event.event_id, timestamp: event.origin_server_ts};
        }

        return Promise.resolve(updatedReadReceipts);
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

    private async upsertReadReceipt(room: Room, eventId: string, userId: string, timestamp: number): Promise<any> {
        await this.dbPromise;

        const dbRecord = {
            roomId: room.roomId,
            eventId: eventId,
            userId: userId,
            timestamp: timestamp,
        };

        return this.db.getByKey("read_receipts", [room.roomId, userId]).then(record => {
            if (record) return this.db.delete("read_receipts", [room.roomId, userId]);
        }).then(() => this.db.add("read_receipts", dbRecord));
    }

    private async deleteRoom(room: Room): Promise<any> {
        await this.dbPromise;

        console.log("Purging " + room.roomId + " from the db");

        // TODO: Deleting a room is painfully slow - surely this can be made better?
        return Promise.all([
            this.db.getByKey("rooms", room.roomId).then(() => this.db.delete("rooms", room.roomId))
                .catch(err => console.error(err)),
            this.db.getAll("account_data").then(records => {
                const toRemove = records.filter(r => r.roomId === room.roomId);
                return toRemove.forEach(r => this.db.delete("account_data", [r.roomId, r.eventType]));
            }).catch(err => console.error(err)),
            this.db.getAll("edus").then(records => {
                const toRemove = records.filter(r => r.roomId === room.roomId);
                return toRemove.forEach(r => this.db.delete("edus", [r.roomId, r.eventType]));
            }).catch(err => console.error(err)),
            this.db.getAll("batches").then(records => {
                const toRemove = records.filter(r => r.roomId === room.roomId);
                return toRemove.forEach(r => this.db.delete("batches", r.id));
            }).catch(err => console.error(err)),
        ]).catch(err => {
            console.error(err);
        }).then(() => console.log("Room " + room.roomId + " purged"));
    }

    private loadFromDb(): Promise<any> {
        this.db = new AngularIndexedDB(ROOMS_DB, 2);
        return this.db.openDatabase(2, evt => {
            switch (evt.oldVersion) {
                case 0:
                    return this.dbFreshInstall(evt);
                case 1:
                    return this.dbUpgradeTo2(evt);
                case 2:
                    return this.dbUpgradeTo3(evt);
            }
        }).then(() => {
            return this.db.getAll("rooms");
        }).then(records => {
            return Promise.all(records.map(r => {
                return this.prepareRoom(r.roomId, r.state).then(room => this.joinedOut.next(room.obj));
            })).then(() => this.updateJoinedRooms());
        }).then(() => {
            return this.db.getAll("batches");
        }).then(records => {
            return Promise.all(records.map(r => {
                const room = this.cache[r.roomId];
                if (!room) {
                    console.warn("Could not find room " + r.roomId + " but we have batches for it");
                    return;
                }
                return this.addEventsToRoom(room.obj, r.events).then(readReceipts => {
                    for (const userId in readReceipts) {
                        room.lastReadReceipts[userId] = readReceipts[userId];
                    }
                });
            }));
        }).then(() => {
            return this.db.getAll("read_receipts");
        }).then(records => {
            // Populate read receipts first
            for (const record of records) {
                const room = this.cache[record.roomId];
                if (!room) {
                    console.warn("Could not find room " + record.roomId + " but we have read receipts for it");
                    continue;
                }

                const currentReceipt = room.lastReadReceipts[record.userId];
                if (currentReceipt) {
                    const currentEventIndex = room.timelineEvents.findIndex(e => e.event.event_id === currentReceipt.eventId);
                    const targetEventIndex = room.timelineEvents.findIndex(e => e.event.event_id === record.eventId);
                    if (targetEventIndex < currentEventIndex) {
                        // Skip read receipt - we have a newer one already stored
                        continue;
                    }
                }
                room.lastReadReceipts[record.userId] = {eventId: record.eventId, timestamp: record.timestamp};
            }

            // Then calculate the new state
            for (const roomId in this.cache) {
                this.calculateNewReadReceipts(this.cache[roomId]);
            }
        }).then(() => {
            // TODO: Load Room Account Data
        });
    }

    private dbFreshInstall(evt: any) {
        this.dbUpgradeTo1(evt);
        this.dbUpgradeTo2(evt);
    }

    private dbUpgradeTo1(evt: any) {
        evt.currentTarget.result.createObjectStore("batches", {
            keyPath: "id",
            autoIncrement: true,
        });
        evt.currentTarget.result.createObjectStore("rooms", {
            keyPath: "roomId",
        });
        evt.currentTarget.result.createObjectStore("account_data", {
            keyPath: ["roomId", "eventType"],
        });
    }

    private dbUpgradeTo2(evt: any) {
        evt.currentTarget.result.createObjectStore("read_receipts", {
            keyPath: ["roomId", "userId"],
        });
        evt.currentTarget.result.deleteObjectStore("edus");
    }

    private dbUpgradeTo3(_evt: any) {
        // Nothing to do, yet
    }
}