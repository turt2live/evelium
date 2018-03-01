import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { MatrixAuthService } from "../../services/matrix/auth.service";

@Component({
    templateUrl: "./landing.component.html",
    styleUrls: ["./landing.component.scss"]
})
export class LandingComponent {
    constructor(router: Router, auth: MatrixAuthService) {
        if (!auth.isLoggedIn()) {
            router.navigate(['/login']);
        } else {
            router.navigate(["/app"]);
        }
    }
}