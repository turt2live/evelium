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
