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
import { Router } from "@angular/router";
import { RoomService } from "../../../services/matrix/room.service";

@Component({
    templateUrl: "./homepage.component.html",
    styleUrls: ["./homepage.component.scss"]
})
export class HomepageComponent implements OnInit {

    constructor(private router: Router, private rooms: RoomService) {
    }

    public ngOnInit() {
        let navigated = false;
        const roomsSubscription = this.rooms.joined.subscribe(() => {
            if (navigated) return;

            navigated = true;
            this.rooms.getAll().then(rooms => this.router.navigate(['app', 'rooms', rooms[0].roomId]));

            if (roomsSubscription) roomsSubscription.unsubscribe();
        });
    }
}