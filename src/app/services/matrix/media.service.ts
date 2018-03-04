import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatrixHomeserverService } from "./homeserver.service";
import { AuthenticatedApi } from "./authenticated-api";
import { MatrixAuthService } from "./auth.service";

@Injectable()
export class MatrixMediaService extends AuthenticatedApi {

    constructor(http: HttpClient, auth: MatrixAuthService,
                private hs: MatrixHomeserverService) {
        super(http, auth);
    }

    public mxcToThumbnailUrl(mxc: string, width: number, height: number, method: "crop" | "scale"): string {
        mxc = this.getMediaPartOnly(mxc);
        return this.hs.buildMediaUrl("/thumbnail/" + mxc + `?width=${width}&height=${height}&method=${method}`)
    }

    public mxcToHttp(mxc: string): string {
        mxc = this.getMediaPartOnly(mxc);
        return this.hs.buildMediaUrl("/download/" + mxc);
    }

    private getMediaPartOnly(mxc: string): string {
        mxc = mxc.substring("mxc://".length);
        mxc = mxc.split("?")[0];
        const parts = mxc.split("/");
        return parts[0] + "/" + parts[1];
    }
}