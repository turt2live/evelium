import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatrixHomeserverService } from "./homeserver.service";
import { LoginResponse, PasswordLoginRequest } from "../../models/matrix/http/login";

@Injectable()
export class MatrixAuthService {
    constructor(private http: HttpClient, private hs: MatrixHomeserverService, private localStorage: Storage) {
    }

    public get accessToken(): string {
        return this.localStorage.getItem("mx.accessToken");
    }

    public set accessToken(token: string) {
        this.localStorage.setItem("mx.accessToken", token);
    }

    public get deviceId(): string {
        return this.localStorage.getItem("mx.deviceId");
    }

    public set deviceId(id: string) {
        this.localStorage.setItem("mx.deviceId", id);
    }

    public get userId(): string {
        return this.localStorage.getItem("mx.userId");
    }

    public set userId(id: string) {
        this.localStorage.setItem("mx.userId", id);
    }

    public isLoggedIn(): boolean {
        return !!this.accessToken;
    }

    public login(username: string, password: string): Promise<string> {
        return this.http.post<LoginResponse>(this.hs.buildCsUrl("login"), new PasswordLoginRequest(username, password)).toPromise().then(r => {
            this.accessToken = r.access_token;
            this.deviceId = r.device_id;
            this.userId = r.user_id;
            return r.user_id;
        });
    }

    public static get USER_ID(): string {
        return window.localStorage.getItem("mx.userId");
    }
}