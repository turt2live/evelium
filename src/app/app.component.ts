import { Component, OnInit } from "@angular/core";
import "../style/app.scss";
import { WhoAmIResponse } from "./models/matrix/http/whoami";
import { AuthenticatedApi } from "./services/matrix/authenticated-api";
import { MatrixAuthService } from "./services/matrix/auth.service";
import { HttpClient } from "@angular/common/http";
import { MatrixHomeserverService } from "./services/matrix/homeserver.service";
import { Router } from "@angular/router";

@Component({
    selector: "my-app", // <my-app></my-app>
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent extends AuthenticatedApi implements OnInit {

    constructor(http: HttpClient, auth: MatrixAuthService,
                private router: Router,
                private hs: MatrixHomeserverService) {
        super(http, auth);
    }

    public ngOnInit() {
        return this.validateToken();
    }

    public validateToken(): Promise<any> {
        const loginRoute = ["/login"];

        if (!this.hs.csApiUrl) {
            return this.router.navigate(loginRoute);
        } else console.log("csApiUrl is " + this.hs.csApiUrl);

        if (!this.auth.accessToken || !this.auth.isLoggedIn()) {
            return this.router.navigate(loginRoute);
        } else console.log("accessToken is set");

        return this.get<WhoAmIResponse>(this.hs.buildCsUrl(`/account/whoami`)).toPromise().then(r => {
            console.log("Token belongs to " + r.user_id);
        }).catch(e => {
            console.error(e);
            return this.router.navigate(loginRoute);
        });
    }
}
