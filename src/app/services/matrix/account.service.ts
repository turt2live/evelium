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

import { Injectable } from "@angular/core";
import { AuthenticatedApi, AuthenticatedApiAccess } from "./authenticated-api";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { Subject } from "rxjs/Subject";
import { AccountDataEvent } from "../../models/matrix/events/account/account-data-event";
import { HomeserverService } from "./homeserver.service";
import { AngularIndexedDB } from "angular2-indexeddb/angular2-indexeddb";
import { WhoAmIResponse } from "../../models/matrix/http/whoami";
import { SyncService } from "./sync.service";
import { ACCOUNT_DATA_DB } from "./databases";
import { SyncResponse } from "../../models/matrix/http/sync";

// For singleton access
let accountData: AccountDataHandler;

/**
 * Service for account-related functions, such as changing passwords and account data.
 */
@Injectable()
export class AccountService extends AuthenticatedApi {

    constructor(http: HttpClient, auth: AuthService, private hs: HomeserverService, private sync: SyncService) {
        super(http, auth);
    }

    /**
     * The account data for the currently logged-in user
     * @returns {AccountDataHandler} The account data.
     */
    public get accountData(): AccountDataHandler {
        if (!accountData) accountData = new AccountDataHandler(this.http, this.auth, this.hs, this.sync);
        return accountData;
    }

    /**
     * Determines who the current logged in user is. This value is not cached and relies on the homeserver
     * returning information about the user.
     * @returns {Promise<string>} Resolves to the user ID who is currently logged in.
     */
    public whoAmI(): Promise<string> {
        return this.get<WhoAmIResponse>(`${this.hs.clientServerApi}/account/whoami`).toPromise().then(r => r.user_id);
    }
}

/**
 * Handles account data processing on behalf of the client. There should only be one
 * instance of this class in the wild.
 */
class AccountDataHandler {

    /**
     * An observable way to access account data. Supplying values to the subject will result
     * in them being set.
     */
    public readonly events: Subject<AccountDataEvent>;
    private eventsOut: Subject<AccountDataEvent>;

    private api: AuthenticatedApiAccess;
    private cache: { [eventType: string]: AccountDataEvent } = {};
    private db: AngularIndexedDB;
    private dbPromise: Promise<any>;

    constructor(http: HttpClient, private auth: AuthService, private hs: HomeserverService, sync: SyncService) {
        this.api = new AuthenticatedApiAccess(http, auth);

        const observable = new Subject<AccountDataEvent>();
        const observer = {
            next: (data: AccountDataEvent) => {
                return this.set(data.type, data.content);
            },
        };
        this.eventsOut = observable;
        this.events = Subject.create(observer, observable);
        this.dbPromise = this.loadFromDb().then(() => console.log("Loaded account data information from database"));

        sync.stream.subscribe(response => this.processSync(response));
    }

    private async processSync(response: SyncResponse): Promise<any> {
        if (!response || !response.account_data || !response.account_data.events) return;

        console.log("Processing account data from sync response");
        await this.dbPromise;
        response.account_data.events.forEach(e => {
            this.cache[e.type] = e;
            this.eventsOut.next(e);
            return this.upsert(e);
        });
    }

    /**
     * Gets the account data for the given event type. If the event is not found, null is returned.
     * @param {string} eventType The event type to look up.
     * @returns {Promise<AccountDataEvent>} Resolves to the found account data, or null if not found.
     */
    public async get(eventType: string): Promise<AccountDataEvent> {
        await this.dbPromise;
        if (!this.cache[eventType]) return Promise.resolve(null);
        return Promise.resolve(this.cache[eventType]);
    }

    /**
     * Sets account data on the user's account. To delete account data, set the content to an empty
     * object or null. This will cause an immediate change which may be reverted if something goes wrong.
     * @param {string} eventType The event type to set.
     * @param {*} content The content to set, or an empty object to mark the event deleted.
     * @returns {Promise<any>} Resolves when the account data has been set.
     */
    public async set(eventType: string, content: any): Promise<any> {
        await this.dbPromise;
        if (content === null) content = {};

        const old = await this.get(eventType);
        const newEvent: AccountDataEvent = {type: eventType, content: content};

        this.cache[eventType] = newEvent;
        this.eventsOut.next(newEvent);
        return this.api.put(`${this.hs.clientServerApi}/user/${this.auth.userId}/account_data/${eventType}`, content).toPromise().then(() => {
            // We did it! Save it async now
            // TODO: Don't save this here, instead wait for it to come down /sync
            return this.upsert(newEvent);
        }).catch(e => {
            console.error(e);
            this.cache[eventType] = old;
            this.eventsOut.next(old);
            return Promise.reject(e);
        });
    }

    private async upsert(event: AccountDataEvent): Promise<any> {
        await this.dbPromise;

        const dbRecord = {
            eventType: event.type,
            content: event.content,
        };

        return this.db.getByKey("account_data", event.type).then(record => {
            if (record) return this.db.update("account_data", dbRecord, event.type);
            else return this.db.add("account_data", dbRecord);
        });
    }

    private loadFromDb(): Promise<any> {
        this.db = new AngularIndexedDB(ACCOUNT_DATA_DB, 1);
        return this.db.openDatabase(1, evt => {
            const accountData = evt.currentTarget.result.createObjectStore("account_data", {
                keyPath: "eventType",
            });

            accountData.createIndex("eventType", "eventType", {unique: false});
            accountData.createIndex("content", "content", {unique: false});
        }).then(() => {
            return this.db.getAll("account_data");
        }).then(records => {
            return records.forEach(r => {
                this.cache[r.eventType] = {type: r.eventType, content: r.content};
            });
        });
    }
}