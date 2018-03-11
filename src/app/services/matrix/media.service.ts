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
import { HomeserverService } from "./homeserver.service";
import { AuthenticatedApi } from "./authenticated-api";
import { AuthService } from "./auth.service";

/**
 * Service for handling Content Repository requests.
 */
@Injectable()
export class MediaService extends AuthenticatedApi {

    constructor(http: HttpClient, auth: AuthService, private hs: HomeserverService) {
        super(http, auth);
    }

    /**
     * Converts an MXC URI to an HTTP(S) URL for a thumbnail.
     * @param {string} mxc The MXC URI to convert.
     * @param {number} width The desired width of the thumbnail.
     * @param {number} height The desired height of the thumbnail.
     * @param {"crop" | "scale"} method The scaling method to use.
     * @returns {string} The HTTP(S) URL for the thumbnail.
     */
    public mxcToThumbnailUrl(mxc: string, width: number, height: number, method: "crop" | "scale"): string {
        mxc = this.getMediaPartOnly(mxc);
        return `${this.hs.mediaApi}/thumbnail/${mxc}?width=${width}&height=${height}&method=${method}`;
    }

    /**
     * Converts an MXC URI to an HTTP(S) URL.
     * @param {string} mxc The MXC URI to convert.
     * @returns {string} The HTTP(S) URL for the content.
     */
    public mxcToHttp(mxc: string): string {
        mxc = this.getMediaPartOnly(mxc);
        return `${this.hs.mediaApi}/download/${mxc}`;
    }

    private getMediaPartOnly(mxc: string): string {
        if (!MediaService.isValidMxc(mxc)) throw new Error("Invalid MXC URI");

        mxc = mxc.substring("mxc://".length);
        mxc = mxc.split("?")[0];
        const parts = mxc.split("/");
        return parts[0] + "/" + parts[1];
    }

    /**
     * Determines if a given MXC URI is in a valid format.
     * @param {string} url The MXC URI to parse.
     * @returns {boolean} True if the URI is correctly formatted, false otherwise.
     */
    public static isValidMxc(url: string): boolean {
        if (!url) return false;
        if (!url.startsWith("mxc://")) return false;

        const parts = url.substring("mxc://".length).split("?")[0].split("/");
        return parts.length >= 2;
    }
}