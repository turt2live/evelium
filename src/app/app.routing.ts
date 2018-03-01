import { RouterModule, Routes } from "@angular/router";
import { LandingComponent } from "./views/landing/landing.component";
import { LoginComponent } from "./views/login/login.component";
import { LoggedInComponent } from "./views/logged-in/logged-in.component";

const routes: Routes = [
    {path: "", component: LandingComponent},
    {path: "login", component: LoginComponent},
    {path: "app", component: LoggedInComponent},
];

export const routing = RouterModule.forRoot(routes);
