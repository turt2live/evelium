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

import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { Router } from "@angular/router";
import { AuthService } from "../../services/matrix/auth.service";
import { HomeserverService } from "../../services/matrix/homeserver.service";

@Component({
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"]
})
export class LoginComponent {

    public username: string; // Could be an email address or mxid
    public password: string;
    public isLoading: boolean;

    constructor(private router: Router,
                private toaster: ToasterService,
                private auth: AuthService,
                private hs: HomeserverService) {
        if (auth.isLoggedIn()) {
            console.log("Redirecting to app: Already logged in");
            router.navigate(["/app"]);
        }
    }

    public login(): void {
        if (!this.username || this.username[0] !== "@") {
            this.toaster.pop("error", "Please enter a matrix user ID", "Email addresses will be supported in a later version");
            return;
        }

        // TODO: Use a .well-known lookup or similar to resolve this
        if (!this.hs.apiUrl) {
            this.hs.apiUrl = "https://" + this.username.substring(this.username.indexOf(":") + 1) + "/_matrix";
        }

        this.auth.login(this.username, this.password).then(() => {
            this.router.navigate(["/app"]);
        }).catch(err => {
            // TODO: replace toasters with in-form feedback
            if (err.status === 403) {
                this.toaster.pop("error", "Invalid username or password");
            } else {
                console.error(err);
                this.toaster.pop("error", "Unknown error logging in");
            }
        });
    }
}