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

import { Component, Input } from "@angular/core";
import { Room } from "../../../models/matrix/dto/room";
import { SimpleRoomMessageEvent } from "../../../models/matrix/events/room/m.room.message";

@Component({
    selector: "my-room-message-composer",
    templateUrl: "./composer.component.html",
    styleUrls: ["./composer.component.scss"]
})
export class RoomMessageComposerComponent {

    @Input() public room: Room;

    public message: string;

    constructor() {
    }

    public sendMessage() {
        if (!this.message || !this.message.trim()) return; // don't send whitespace

        const event = new SimpleRoomMessageEvent(this.message);
        this.message = "";

        this.room.timeline.next(event);
    }
}