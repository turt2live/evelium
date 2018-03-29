/*
 *     Evelium - A matrix client
 *     Copyright (C)  2018 Will Hunt
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
import { WellKnownResponse } from "../../models/matrix/http/wellknown";
import { HttpClient } from "@angular/common/http";
import * as urlparse from "url-parse";

/**
 * Service for fetching .well-known information about a host.
 */
@Injectable()
export class WellKnownService {
    constructor(private http: HttpClient) {

    }

    public getWellKnownForUser(userId: string): Promise<WellKnownResponse> {
        const domainPart = userId.split(/:(.+)/)[1];
        if ( domainPart === undefined ) {
            return Promise.reject(new Error(`Domain was not well formed on userId "${userId}"`));
        }
        return this.getWellKnownForDomain(domainPart);

    }

    // Taken from https://docs.google.com/document/d/1OdEj06qA7diURofyonIMgTR3fB_pWf12Txye41qd-U4
    public async getWellKnownForDomain(hostname: string): Promise<WellKnownResponse> {
        const uri = `https://${hostname}/.well-known/matrix/client`;
        // We have to construct this object ourselves, because the object doesn't fit nicely into an interface.
        const data = await this.http.get(uri).toPromise();
        const response = new WellKnownResponse();
        if (data["m.homeserver"]) {
            try {
                urlparse(data["m.homeserver"].base_url, {});
            } catch (e) {
                throw new Error(`m.homeserver.base_url is not well formed."`);
            }
            response.homeserver = { base_url: data["m.homeserver"].base_url };
        } else {
            throw new Error(`m.homeserver.base_url was not given."`);
        }

        if (data["m.identity_server"]) {
            try {
                urlparse(data["m.identity_server"].base_url, {});
            } catch (e) {
                throw new Error(`m.identity_server.base_url is not well formed."`);
            }
            response.identity_server = { base_url: data["m.identity_server"].base_url };
        } // Do not throw if the identity_server is not given. It is not a requirement.
        return response;
    }
}