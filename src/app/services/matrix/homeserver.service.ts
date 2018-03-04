import { Injectable } from "@angular/core";

@Injectable()
export class MatrixHomeserverService {

    constructor(private localStorage: Storage) {
    }

    public get csApiUrl(): string {
        return this.localStorage.getItem("mx.csApiUrl");
    }

    public set csApiUrl(newUrl: string) {
        this.localStorage.setItem("mx.csApiUrl", newUrl);
    }

    public get mediaApiUrl(): string {
        // The media API is technically under the same place as the CS API
        return this.localStorage.getItem("mx.csApiUrl");
    }

    public set mediaApiUrl(newUrl: string) {
        // The media API is technically under the same place as the CS API
        this.localStorage.setItem("mx.csApiUrl", newUrl);
    }

    public buildMediaUrl(action: string, version="r0"):string {
        let baseUrl = this.mediaApiUrl;
        if (baseUrl.endsWith("/")) baseUrl = baseUrl.substring(0, baseUrl.length - 1);
        if (action.startsWith("/")) action = action.substring(1);

        return `${baseUrl}/media/${version}/${action}`;
    }

    public buildCsUrl(action: string, version = "r0"): string {
        let baseUrl = this.csApiUrl;
        if (baseUrl.endsWith("/")) baseUrl = baseUrl.substring(0, baseUrl.length - 1);
        if (action.startsWith("/")) action = action.substring(1);

        return `${baseUrl}/client/${version}/${action}`;
    }
}