import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { MatrixAuthService } from "../../services/matrix/auth.service";
import { MatrixHomeserverService } from "../../services/matrix/homeserver.service";
import { Router } from "@angular/router";

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
                private auth: MatrixAuthService,
                private hs: MatrixHomeserverService) {
        if (auth.isLoggedIn()) {
            router.navigate(["/app"]);
        }
    }

    public login(): void {
        if (!this.username || this.username[0] !== "@") {
            this.toaster.pop("error", "Please enter a matrix user ID", "Email addresses will be supported in a later version");
            return;
        }

        // TODO: Use a .well-known lookup or similar to resolve this
        this.hs.csApiUrl = "https://" + this.username.substring(this.username.indexOf(":") + 1) + "/_matrix";

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