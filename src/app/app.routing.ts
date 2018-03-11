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
