import { RouterModule, Routes } from "@angular/router";
import { LandingComponent } from "./views/landing/landing.component";

const routes: Routes = [
    {path: "", component: LandingComponent},
];

export const routing = RouterModule.forRoot(routes);
