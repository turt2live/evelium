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

/**
 * Service for holding various pieces of information about a connected matrix homeserver.
 */
@Injectable()
export class HomeserverService {
    constructor(private localStorage: Storage) {
    }

    /**
     * Determines if the generic API URL is available for use.
     * @returns {boolean} True if the generic API URL is available, false otherwise.
     */
    public get isApiUrlSet(): boolean {
        return !!this.localStorage.getItem("mx.csApiUrl");
    }

    /**
     * Sets the generic API URL for accessing the client/server API as well as the Content Repository.
     * @param {string} url The base URL to set.
     */
    public set apiUrl(url: string) {
        this.localStorage.setItem("mx.csApiUrl", url);
    }

    /**
     * Gets the base URL for the client/server API.
     * @returns {string} The base URL for the client/server API.
     */
    public get clientServerApi(): string {
        return this.localStorage.getItem("mx.csApiUrl") + "/client/r0";
    }

    /**
     * Gets the base URL for the client/server Content Repository API.
     * @returns {string} The base URL for the content repository API.
     */
    public get mediaApi(): string {
        return HomeserverService.MEDIA_API;
    }

    /**
     * Gets the base URL for the client/server Content Repository API.
     * @returns {string} The base URL for the content repository API.
     */
    public static get MEDIA_API(): string {
        return localStorage.getItem("mx.csApiUrl") + "/media/r0";
    }
}