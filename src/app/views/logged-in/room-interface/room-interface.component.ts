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

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Room } from "../../../models/matrix/dto/room";
import { RoomService } from "../../../services/matrix/room.service";

@Component({
    templateUrl: "./room-interface.component.html",
    styleUrls: ["./room-interface.component.scss"]
})
export class RoomInterfaceComponent implements OnInit, OnDestroy {

    public activeRoom: Room;

    private paramsSubscription: Subscription;

    constructor(private activeRoute: ActivatedRoute, private rooms: RoomService, private router: Router) {
    }

    public ngOnInit() {
        this.paramsSubscription = this.activeRoute.params.subscribe(params => {
            this.rooms.getById((params || {})['roomId'])
                .then(r => this.activeRoom = r)
                .catch(err => {
                    console.error(err);
                    this.router.navigate(['app']); // Redirect elsewhere
                });
        });
    }

    public ngOnDestroy() {
        if (this.paramsSubscription) this.paramsSubscription.unsubscribe();
    }
}