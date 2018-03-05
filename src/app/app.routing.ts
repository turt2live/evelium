import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./views/login/login.component";
import { LandingComponent } from "./views/landing/landing.component";
import { LoggedInComponent } from "./views/logged-in/logged-in.component";
import { RoomInterfaceComponent } from "./views/logged-in/room-interface/room-interface.component";
import { HomepageComponent } from "./views/logged-in/homepage/homepage.component";

const routes: Routes = [
    {path: "", component: LandingComponent},
    {path: "login", component: LoginComponent},
    {
        path: "app",
        component: LoggedInComponent,
        children: [
            {path: '', pathMatch: 'full', redirectTo: 'home'},
            {path: 'home', component: HomepageComponent},
            {path: 'rooms/:roomId', component: RoomInterfaceComponent},
        ],
    },
    {path: '**', redirectTo: ''}, // 404
];

// Note: We use the hash because otherwise the interface can get confused with room IDs/aliases
export const routing = RouterModule.forRoot(routes, {useHash: true});
