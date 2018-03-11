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
        return this.localStorage.getItem("mx.csApiUrl") + "/media/r0";
    }
}