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
import { HomeserverService } from "./homeserver.service";
import { SyncResponse } from "../../models/matrix/http/sync";
import { Observable } from "rxjs/Observable";
import { ReplaySubject } from "rxjs/ReplaySubject";

// For singleton access
let syncer: SyncHandler;

/**
 * Service responsible for ensuring a sync stream for the logged in user is established
 */
@Injectable()
export class SyncService extends AuthenticatedApi {

    constructor(http: HttpClient, auth: AuthService, private hs: HomeserverService, private localStorage: Storage) {
        super(http, auth);
    }

    private checkSyncer(): void {
        if (!syncer) syncer = new SyncHandler(this.http, this.auth, this.hs, this.localStorage);
    }

    /**
     * Gets access to the sync stream for the logged in user
     * @returns {Observable<SyncResponse>} The current sync stream for the logged in user
     */
    public get stream(): Observable<SyncResponse> {
        this.checkSyncer();
        return syncer.stream;
    }

    /**
     * Begins syncing for the current user, if syncing hasn't already been started. If a sync stream
     * is already established for the current user then this is a no-op.
     */
    public startSyncing(): void {
        this.checkSyncer();
        syncer.start();
    }
}

/**
 * Handles syncing for the currently logged in user. There should only be one instance of this class in the wild.
 */
class SyncHandler {

    /**
     * An observable way to see sync responses.
     */
    public readonly stream: Observable<SyncResponse>;
    private streamOut: Subject<SyncResponse>;

    private api: AuthenticatedApiAccess;
    private isSyncing = false;

    constructor(http: HttpClient, auth: AuthService, private hs: HomeserverService, private localStorage: Storage) {
        this.api = new AuthenticatedApiAccess(http, auth);

        const observable = new ReplaySubject<SyncResponse>(5);
        this.stream = observable;
        this.streamOut = observable;
    }

    /**
     * Begins syncing. If syncing is already in progress then this is a no-op.
     */
    public start(): void {
        if (this.isSyncing) return; // No-op

        console.log("Starting sync loop");
        this.isSyncing = true;
        let nextToken: string = this.localStorage.getItem("mx.syncToken");
        const handler = (r: SyncResponse) => {
            console.log("Advertising sync response");
            this.streamOut.next(r);

            nextToken = r.next_batch;
            this.localStorage.setItem("mx.syncToken", nextToken);
            return this.doSync(nextToken).then(handler).catch(errorHandler);
        };
        const errorHandler = (e: Error) => {
            // TODO: Back off
            console.error(e);
            if ((<any>e).status === 404) {
                return Promise.resolve();
            }
            return this.doSync(nextToken).then(handler).catch(errorHandler);
        };

        this.doSync(nextToken).then(handler).catch(errorHandler);
    }

    private doSync(token: string = null): Promise<any> {
        const request = {
            timeout: 30000,
        };
        if (token) request["since"] = token;
        return this.api.get<SyncResponse>(`${this.hs.clientServerApi}/sync`, request).toPromise();
    }
}