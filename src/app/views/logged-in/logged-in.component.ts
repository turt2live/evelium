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
import { SyncService } from "../../services/matrix/sync.service";
import { RoomService } from "../../services/matrix/room.service";
import { NotificationsService } from "../../services/matrix/notifications.service";

@Component({
    templateUrl: "./logged-in.component.html",
    styleUrls: ["./logged-in.component.scss"]
})
export class LoggedInComponent implements OnInit {

    public receivedRoomList = false;

    constructor(private sync: SyncService, private rooms: RoomService, notifications: NotificationsService) {
        notifications.getPushRules();
    }

    public ngOnInit() {
        this.sync.startSyncing();
        const roomSubscription = this.rooms.currentlyJoined.subscribe(() => {
            this.receivedRoomList = true;
            roomSubscription.unsubscribe(); // we don't care anymore
        });
    }
}