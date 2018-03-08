import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatrixHomeserverService } from "./homeserver.service";
import { AuthenticatedApi } from "./authenticated-api";
import { MatrixAuthService } from "./auth.service";
import {
    RoomAccountData, RoomEphemeralTimeline, RoomTimeline, SyncJoinedRooms,
    SyncResponse
} from "../../models/matrix/http/sync";
import { Observable } from "rxjs/Observable";
import { MatrixRoom } from "../../models/matrix/dto/room";
import { MatrixRoomService } from "./room.service";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { MatrixAccountService } from "./account.service";
import { AccountDataEvent } from "../../models/matrix/events/account/account-data-event";
import { RoomStateEvent } from "../../models/matrix/events/room/state/room-state-event";
import { AngularIndexedDB } from "angular2-indexeddb/angular2-indexeddb";
import { PersistedEventBatch } from "../../models/storage/event-batch";
import { PersistedRoomState } from "../../models/storage/room-state";
import { RoomEvent } from "../../models/matrix/events/room/room-event";

const MAX_PERSISTED_TIMELINE_EVENTS = 50;

@Injectable()
export class MatrixSyncService extends AuthenticatedApi {

    private static IS_SYNCING = false;
    private static EVENT_STREAMS = {
        "self.room.join": new ReplaySubject<MatrixRoom>(),
        "self.room.list": new ReplaySubject<MatrixRoom[]>(),
    };

    private db: AngularIndexedDB;

    private batchSizeMap: { [roomId: string]: { [batchId: number]: number } } = {};

    constructor(http: HttpClient, auth: MatrixAuthService,
                private hs: MatrixHomeserverService,
                private rooms: MatrixRoomService,
                private account: MatrixAccountService,
                private localStorage: Storage) {
        super(http, auth);
    }

    private initDb(): Promise<any> {
        if (this.db) return Promise.resolve();

        const db = new AngularIndexedDB("evelium.sync", 1);
        return db.openDatabase(1, evt => {
            const batches = evt.currentTarget.result.createObjectStore("batches", {
                keyPath: "id",
                autoIncrement: true,
            });
            batches.createIndex("roomId", "roomId", {unique: false});
            batches.createIndex("startToken", "startToken", {unique: false});
            batches.createIndex("endToken", "endToken", {unique: false});
            batches.createIndex("events", "events", {unique: false});

            const roomState = evt.currentTarget.result.createObjectStore("room_state", {
                keyPath: "id",
                autoIncrement: true,
            });
            roomState.createIndex("roomId", "roomId", {unique: true});
            roomState.createIndex("events", "events", {unique: false});

            const eduStore = evt.currentTarget.result.createObjectStore("room_edus", {
                keyPath: "id",
                autoIncrement: true,
            });
            eduStore.createIndex("roomId", "roomId", {unique: false});
            eduStore.createIndex("eventType", "eventType", {unique: false});
            eduStore.createIndex("content", "content", {unique: false});
        }).then(() => this.db = db);
    }

    public getStream<T>(event: string): Observable<T> {
        if (!MatrixSyncService.EVENT_STREAMS[event]) {
            MatrixSyncService.EVENT_STREAMS[event] = new ReplaySubject<T>();
        }
        return MatrixSyncService.EVENT_STREAMS[event];
    }

    private getBroadcastStream<T>(event: string): ReplaySubject<T> {
        return <ReplaySubject<T>>this.getStream<T>(event);
    }

    public startSyncing(): void {
        if (MatrixSyncService.IS_SYNCING) return;

        MatrixSyncService.IS_SYNCING = true;
        this.loadFromDb().then(() => this.loopSyncing());
    }

    private loadFromDb(): Promise<any> {
        console.log("Loading sync data from db...");
        return this.initDb()
            .then(() => this.getStoredRooms())
            .then(rooms => rooms.map(r => this.rooms.cacheRoomFromState(r.roomId, r.events)))
            .then(rooms => this.getBroadcastStream("self.room.list").next(rooms))
            .then(() => this.getBatches())
            .then(batches => batches.forEach(b => this.processBatch(b)));
    }

    private getStoredRooms(): Promise<PersistedRoomState[]> {
        console.log("Getting stored rooms...");
        return this.db.getAll("room_state").then(results => {
            console.log(results.length + " stored rooms");
            return results.map(r => PersistedRoomState.parse(r));
        }).catch(err => {
            console.error(err);
            return [];
        });
    }

    private getBatches(): Promise<PersistedEventBatch[]> {
        console.log("Getting stored event batches...");
        return this.db.getAll("batches").then(results => {
            console.log(results.length + " stored batches");
            return PersistedEventBatch.parseAll(results);
        }).catch(err => {
            console.error(err);
            return [];
        });
    }

    private storeNewRoom(room: MatrixRoom): Promise<any> {
        console.log("Storing new room in db: " + room.id);
        return this.db.add("room_state", PersistedRoomState.fromRoom(room).toRaw(false));
    }

    private updateRoom(room: MatrixRoom): Promise<any> {
        console.log("Updating room in db: " + room.id);
        return this.db.update("room_state", PersistedRoomState.fromRoom(room).toRaw());
    }

    private storeEventBatch(roomId: string, startToken: string, endToken: string, events: RoomEvent[]): Promise<any> {
        if (events.length <= 0) return; // Skip storing this batch

        console.log("Storing new event batch for " + roomId + " with end token " + endToken);
        const batch = new PersistedEventBatch(0, roomId, events, startToken, endToken); // id doesn't matter
        return this.db.add("batches", batch.toRaw(false)).then(r => {
            batch.id = r.key;

            if (!this.batchSizeMap[roomId]) this.batchSizeMap[roomId] = {};
            this.batchSizeMap[roomId][batch.id] = batch.events.length;

            let storedEvents = 0;
            for (const batchId in this.batchSizeMap[roomId]) {
                storedEvents += this.batchSizeMap[roomId][batchId];
            }

            if (storedEvents > MAX_PERSISTED_TIMELINE_EVENTS) {
                console.log("Trimming stored timeline for room " + roomId);

                let freedEvents = 0;
                const toDelete = [];
                const batchIds = Object.keys(this.batchSizeMap[roomId]).map(i => Number(i)).sort();
                for (const batchId of batchIds) {
                    const ifDeletedCount = storedEvents - freedEvents - this.batchSizeMap[roomId][batchId];
                    if (ifDeletedCount >= MAX_PERSISTED_TIMELINE_EVENTS) {
                        freedEvents += this.batchSizeMap[roomId][batchId];
                        toDelete.push(batchId);
                        delete this.batchSizeMap[roomId][batchId];
                    } else break;
                }

                console.log("Deleting " + toDelete.length + " batches to remove " + freedEvents + " events");
                return Promise.all(toDelete.map(id => this.db.delete("batches", id)));
            }
        });
    }

    private processBatch(batch: PersistedEventBatch): Promise<any> {
        //console.log("Processing batch: " + batch.id);

        const room = this.rooms.getRoom(batch.roomId);
        if (!room) {
            console.error("Room not found: " + batch.roomId);
            return Promise.resolve();
        }

        if (!room.backfillToken) room.backfillToken = batch.endToken;
        this.addEventsToRoom(room, batch.events);

        return Promise.resolve();
    }

    private loopSyncing() {
        let nextToken: string = this.localStorage.getItem("mx.syncToken");
        const handler = (r: SyncResponse) => {
            return this.parseSync(r, nextToken).then(() => {
                nextToken = r.next_batch;
                this.localStorage.setItem("mx.syncToken", nextToken);
                return this.doSync(nextToken).then(handler).catch(errorHandler);
            });
        };
        const errorHandler = (e: Error) => {
            // TODO: Back off
            console.error(e);
            return this.doSync(nextToken).then(handler).catch(errorHandler);
        };

        this.doSync(nextToken).then(handler).catch(errorHandler);
    }

    private doSync(token: string = null): Promise<any> {
        const request = {
            timeout: 30000,
        };
        if (token) request["since"] = token;
        return this.get<SyncResponse>(this.hs.buildCsUrl("sync"), request).toPromise();
    }

    private parseSync(sync: SyncResponse, startToken: string): Promise<any> {
        if (!sync) return Promise.resolve();

        const promises: Promise<any>[] = [];

        if (sync.account_data && sync.account_data.events) {
            promises.push(this.parseSyncAccountData(sync.account_data.events));
        }
        if (sync.rooms && sync.rooms.join) {
            promises.push(this.parseSyncJoinedRooms(sync.rooms.join, startToken, sync.next_batch));
        }

        return Promise.all(promises);
    }

    private parseSyncAccountData(events: AccountDataEvent[]): Promise<any> {
        return Promise.all(events.map(event => this.account.setAccountData(event, true)));
    }

    private parseSyncJoinedRooms(joined: SyncJoinedRooms, startToken: string, endToken: string): Promise<any> {
        return Promise.all(Object.keys(joined).map(roomId => {
            const room = joined[roomId];

            let existingRoom = this.rooms.getRoom(roomId);
            if (!existingRoom) {
                if (!room.state || !room.state.events) {
                    console.warn("Room " + roomId + " has no state - skipping room join");
                    return Promise.resolve();
                }
                existingRoom = this.rooms.cacheRoomFromState(roomId, room.state.events);
                this.storeNewRoom(existingRoom)
                    .then(() => this.getBroadcastStream("self.room.join").next(existingRoom));
            }

            const promises: Promise<any>[] = [
                // Each of these should no-op if the root key doesn't exist or is invalid
                this.processRoomAccountData(room.account_data, existingRoom),
                this.processRoomEdus(room.ephemeral, existingRoom),
                this.processTimeline(existingRoom, room.timeline, startToken, endToken),
            ];

            return <Promise<any>>Promise.all(promises);
        }));
    }

    private processRoomEdus(ephemeralTimeline: RoomEphemeralTimeline, room: MatrixRoom): Promise<any> {
        if (!ephemeralTimeline || !ephemeralTimeline.events) return Promise.resolve();

        // TODO: Raise 'new ephemeral event' events somewhere
        const filteredEvents = ephemeralTimeline.events.filter(e => e.type !== "m.typing");
        return this.initDb().then(() => Promise.all(filteredEvents.map(e => {
            return this.db.getByKey("room_edus", {roomId: room.id, eventType: e.type})
                .then(record => {
                    // Exists: update
                    return this.db.update("room_edus", {
                        roomId: room.id,
                        eventType: e.type,
                        content: e.content
                    }, record.id);
                }, () => {
                    // Doesn't exist, create
                    return this.db.add("room_edus", {
                        roomId: room.id,
                        eventType: e.type,
                        content: e.content,
                    });
                });
        })));
    }

    private processRoomAccountData(accountData: RoomAccountData, room: MatrixRoom): Promise<any> {
        if (!accountData || !accountData.events) return Promise.resolve();
        return Promise.all(accountData.events.map(event => this.account.setRoomAccountData(event, room, true)));
    }

    private processTimeline(room: MatrixRoom, timeline: RoomTimeline, startToken: string, endToken: string): Promise<any> {
        if (!timeline || !timeline.events) return Promise.resolve();

        const diff = this.addEventsToRoom(room, timeline.events);

        const promises: Promise<any>[] = [];
        if (diff.stateChanged) {
            promises.push(this.updateRoom(room));
        }
        if (diff.timelineUpdated) {
            promises.push(this.storeEventBatch(room.id, startToken, endToken, timeline.events));
        }

        return Promise.all(promises);
    }

    private addEventsToRoom(room: MatrixRoom, events: RoomEvent[]): { stateChanged: boolean, timelineUpdated: boolean } {
        let stateChanged = false;
        for (const event of events) {
            // First see if we need to update our state
            const stateEvent = <RoomStateEvent>event;
            if (stateEvent.state_key !== undefined) {
                //console.log("Updating state event " + stateEvent.type + " in " + room.id);

                // First remove the event we're replacing, if it exists
                if (stateEvent.unsigned && stateEvent.unsigned.replaces_state) {
                    const oldStateEvent = room.state.find(e => e.event_id === stateEvent.unsigned.replaces_state);
                    if (oldStateEvent) room.removeStateEvent(oldStateEvent);
                }

                // Remove anything that matches the type+state_key combo
                const toRemove = room.state.filter(e => e.type === stateEvent.type && e.state_key === stateEvent.state_key);
                toRemove.forEach(e => room.removeStateEvent(e));

                room.addStateEvent(stateEvent);
            }

            // Now process the event as a regular timeline event
            room.addTimelineEvent(event);
        }

        return {stateChanged: stateChanged, timelineUpdated: events.length > 0};
    }
}