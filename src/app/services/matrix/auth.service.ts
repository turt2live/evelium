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
import { HttpClient } from "@angular/common/http";
import { LoginResponse, PasswordLoginRequest } from "../../models/matrix/http/login";
import { HomeserverService } from "./homeserver.service";

/**
 * Service for handling authentication-related functions, such as logging in or registering accounts.
 */
@Injectable()
export class AuthService {

    constructor(private http: HttpClient, private hs: HomeserverService, private localStorage: Storage) {
    }

    /**
     * The current access token for the logged in user, if any. Care should be taken to ensure this is not
     * accidentally, or intentionally, leaked outside of direct usage.
     * @returns {string} The current access token.
     */
    public get accessToken(): string {
        return this.localStorage.getItem("mx.accessToken");
    }

    /**
     * The current device ID for the logged in user, if any.
     * @returns {string} The current device ID.
     */
    public get deviceId(): string {
        return this.localStorage.getItem("mx.deviceId");
    }

    /**
     * The cached user ID for the logged in user, if any. This is cached locally to the client and
     * may not be a true representation - use the whoAmI() function of the account service for a more
     * accurate user ID for the access token.
     * @returns {string} The cached user ID.
     */
    public get userId(): string {
        return this.localStorage.getItem("mx.userId");
    }

    /**
     * Determines if a user is likely to be logged in. This may not guarantee that the user is logged
     * in, but can guarantee that fields required to make authenticated calls are present.
     * @returns {boolean} True or false depending on whether or not a user could be logged in.
     */
    public isLoggedIn(): boolean {
        return !!this.accessToken;
    }

    /**
     * Logs a user in, overwriting the access token, device ID, and user ID upon a successful request. The
     * caller is responsible for ensuring the HomeserverService is correctly set up to make this request
     * and that any data from a previous user is cleaned up appropriately.
     * @param {string} username The username to log in with.
     * @param {string} password The password to log in with. Should not be exposed anywhere else.
     * @returns {Promise<string>} Resolves to the user ID of the newly logged in user.
     */
    public login(username: string, password: string): Promise<string> {
        return this.http.post<LoginResponse>(`${this.hs.clientServerApi}/login`, new PasswordLoginRequest(username, password)).toPromise().then(r => {
            this.localStorage.setItem("mx.accessToken", r.access_token);
            this.localStorage.setItem("mx.deviceId", r.device_id);
            this.localStorage.setItem("mx.userId", r.user_id);
            return r.user_id;
        });
    }

    /**
     * Gets the currently logged in user in a static context.
     * @returns {string} The currently logged in user ID
     */
    public static get USER_ID(): string {
        return localStorage.getItem("mx.userId");
    }
}