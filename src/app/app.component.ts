import { Component, OnInit } from "@angular/core";
import "../style/app.scss";
import { Router } from "@angular/router";
import { AuthService } from "./services/matrix/auth.service";
import { AccountService } from "./services/matrix/account.service";
import { HomeserverService } from "./services/matrix/homeserver.service";

@Component({
    selector: "my-app", // <my-app></my-app>
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {

    constructor(private auth: AuthService, private router: Router, private account: AccountService, private hs: HomeserverService) {
    }

    public async ngOnInit() {
        await this.validateToken();
    }

    public validateToken(): Promise<any> {
        const loginRoute = ["/login"];

        if (!this.hs.isApiUrlSet) {
            console.log("Redirecting to login: Missing API URL");
            return this.router.navigate(loginRoute);
        } else console.log("csApiUrl is " + this.hs.clientServerApi);

        if (!this.auth.accessToken || !this.auth.isLoggedIn()) {
            console.log("Redirecting to login: Missing access token");
            return this.router.navigate(loginRoute);
        } else console.log("accessToken is set");

        return this.account.whoAmI().then(userId => {
            console.log("I am " + userId);
        }).catch(e => {
            console.error(e);
            console.log("Redirecting to login: Error checking whoami");
            return this.router.navigate(loginRoute);
        });
    }
}
