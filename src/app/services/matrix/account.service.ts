import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatrixHomeserverService } from "./homeserver.service";
import { AuthenticatedApi } from "./authenticated-api";
import { MatrixAuthService } from "./auth.service";
import { AccountDataEvent } from "../../models/matrix/events/account/account-data-event";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { Observable } from "rxjs/Observable";
import { AngularIndexedDB } from "angular2-indexeddb/angular2-indexeddb";
import { RoomAccountDataEvent } from "../../models/matrix/events/account/room_account/room-account-data-event";
import { MatrixRoom } from "../../models/matrix/dto/room";

export interface RoomAccountDataUpdatedEvent {
    event: RoomAccountDataEvent;
    room: MatrixRoom;
}

@Injectable()
export class MatrixAccountService extends AuthenticatedApi {

    private static ACCOUNT_DATA: { [eventType: string]: AccountDataEvent } = {};
    private static ACCOUNT_DATA_STREAM = new ReplaySubject<AccountDataEvent>();
    private static ROOM_ACCOUNT_DATA: { [roomId: string]: { [eventType: string]: RoomAccountDataEvent } } = {};
    private static ROOM_ACCOUNT_DATA_STREAM = new ReplaySubject<RoomAccountDataUpdatedEvent>();

    private db: AngularIndexedDB;

    constructor(http: HttpClient, auth: MatrixAuthService,
                private hs: MatrixHomeserverService) {
        super(http, auth);
    }

    /**
     * Initializes the internal database for account data. No-ops if the database has already been set up
     * @returns {Promise<any>} Resolves when the database is ready.
     */
    private initDb(): Promise<any> {
        if (this.db) return Promise.resolve();

        const db = new AngularIndexedDB("evelium.account_data", 1);
        return db.openDatabase(1, evt => {
            const batches = evt.currentTarget.result.createObjectStore("account_data", {
                keyPath: "id",
                autoIncrement: true,
            });
            batches.createIndex("roomId", "roomId", {unique: false}); // nullable
            batches.createIndex("eventType", "eventType", {unique: false});
            batches.createIndex("content", "content", {unique: false});
        }).then(() => this.db = db);
    }

    public getAccountDataStream(): Observable<AccountDataEvent> {
        return MatrixAccountService.ACCOUNT_DATA_STREAM;
    }

    public getRoomAccountDataStream(): Observable<RoomAccountDataUpdatedEvent> {
        return MatrixAccountService.ROOM_ACCOUNT_DATA_STREAM;
    }

    /**
     * Gets account data from the underlying store. If the event requested does not exist then null will be returned.
     * @param {string} eventType The event type to look up
     * @returns {Promise<T extends AccountDataEvent|AccountDataEvent>} Resolves to the requested account data, or null if not found
     */
    public getAccountData<T extends AccountDataEvent | AccountDataEvent>(eventType: string): Promise<T | AccountDataEvent> {
        return this.lookupAccountData(eventType, null);
    }

    /**
     * Gets account data from the underlying store for a given room. If the event requested does not exist then null will be returned.
     * @param {string} eventType The event type to look up
     * @param {MatrixRoom} room The room to get account data for
     * @returns {Promise<T extends RoomAccountDataEvent|RoomAccountDataEvent>} Resolves to the requested account data, or null if not found
     */
    public getRoomAccountData<T extends RoomAccountDataEvent | RoomAccountDataEvent>(eventType: string, room: MatrixRoom): Promise<T | RoomAccountDataEvent> {
        return this.lookupAccountData(eventType, room.id).then(e => <RoomAccountDataEvent>e);
    }

    private lookupAccountData(eventType: string, roomId: string): Promise<AccountDataEvent> {
        const store = roomId ? MatrixAccountService.ROOM_ACCOUNT_DATA[roomId] : MatrixAccountService.ACCOUNT_DATA;
        if (store && store[eventType]) return Promise.resolve(store[eventType]);

        return this.initDb()
            .then(() => this.db.getByKey("account_data", {eventType: eventType, roomId: roomId}))
            .then(record => <AccountDataEvent>{type: record.eventType, content: record.content})
            .catch(() => Promise.resolve(null)); // intentionally ignore errors
    }

    public getStoredAccountData(): Promise<AccountDataEvent[]> {
        return this.initDb()
            .then(() => this.db.getAll("account_data"))
            .then(records => records.filter(r => !r.roomId).map(r => {
                return {type: r.eventType, content: r.content};
            }));
    }

    public getStoredRoomAccountData(): Promise<{ roomId: string, event: RoomAccountDataEvent }[]> {
        return this.initDb()
            .then(() => this.db.getAll("account_data"))
            .then(records => records.filter(r => r.roomId).map(r => {
                return {roomId: r.roomId, event: {type: r.eventType, content: r.content}};
            }));
    }

    public async setAccountData(event: AccountDataEvent, cacheOnly = false, persistCache = true): Promise<any> {
        console.log("Updating account data: " + event.type);
        const oldEvent = await this.getAccountData(event.type);
        MatrixAccountService.ACCOUNT_DATA[event.type] = event;
        MatrixAccountService.ACCOUNT_DATA_STREAM.next(event);
        if (persistCache) await this.persistAccountData(event, null);
        if (cacheOnly) return; // stop here

        return this.put(this.hs.buildCsUrl(`user/${this.auth.userId}/account_data/${event.type}`, event.content)).toPromise().then(() => {
            console.log("Successfully saved account data: " + event.type);
        }).catch(e => {
            console.error(e);
            MatrixAccountService.ACCOUNT_DATA[event.type] = oldEvent;
            MatrixAccountService.ACCOUNT_DATA_STREAM.next(oldEvent); // Send the reverted event
            return this.persistAccountData(event, null).then(() => Promise.reject(e)); // persist and rethrow
        });
    }

    public async setRoomAccountData(event: RoomAccountDataEvent, room: MatrixRoom, cacheOnly = false, persistCache = true): Promise<any> {
        console.log("Updating room account data: " + event.type + " in " + room.id);
        if (!MatrixAccountService.ROOM_ACCOUNT_DATA[room.id]) MatrixAccountService.ROOM_ACCOUNT_DATA[room.id] = {};

        const oldEvent = await this.getRoomAccountData(event.type, room);
        MatrixAccountService.ROOM_ACCOUNT_DATA[room.id][event.type] = event;
        MatrixAccountService.ROOM_ACCOUNT_DATA_STREAM.next({event: event, room: room});
        if (persistCache) await this.persistAccountData(event, room.id);
        if (cacheOnly) return; // stop here

        return this.put(this.hs.buildCsUrl(`user/${this.auth.userId}/rooms/${room.id}/account_data/${event.type}`, event.content)).toPromise().then(() => {
            console.log("Successfully saved room account data: " + event.type + " in " + room.id);
        }).catch(e => {
            console.error(e);
            MatrixAccountService.ROOM_ACCOUNT_DATA[room.id][event.type] = oldEvent;
            MatrixAccountService.ROOM_ACCOUNT_DATA_STREAM.next({event: event, room: room}); // Send the reverted event
            return this.persistAccountData(event, room.id).then(() => Promise.reject(e)); // persist and rethrow
        });
    }

    private persistAccountData(event: AccountDataEvent, roomId: string): Promise<any> {
        return this.initDb()
            .then(() => this.db.getByKey("account_data", {eventType: event.type, roomId: roomId}))
            .then(record => {
                // Exists: update
                return this.db.update("account_data", {
                    eventType: event.type,
                    roomId: roomId,
                    content: event.content
                }, record.id);
            }, () => {
                // Doesn't exist: add
                return this.db.add("account_data", {
                    eventType: event.type,
                    roomId: roomId,
                    content: event.content
                });
            });
    }
}