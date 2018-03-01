import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    templateUrl: "./landing.component.html",
    styleUrls: ["./landing.component.scss"]
})
export class LandingComponent {
    constructor(private router: Router) {
        // TODO: Check if we have a token or not
        this.router.navigate(['/login']);
    }
}