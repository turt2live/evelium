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

import { Component } from "@angular/core";
import { RoomMemberEvent } from "../../../models/matrix/events/room/state/m.room.member";
import { User } from "../../../models/matrix/dto/user";
import { EventTileComponentBase } from "../event-tile.component.base";
import moment = require("moment");

@Component({
    selector: "my-message-event-tile",
    templateUrl: "./message.component.html",
    styleUrls: ["./message.component.scss"]
})
export class MessageEventTileComponent extends EventTileComponentBase {

    constructor() {
        super();
    }

    public get showSender(): boolean {
        if (this.previousEvent) {
            return this.previousEvent.sender !== this.event.sender || this.previousEvent.type !== "m.room.message";
        } else return true;
    }

    private getRoomMembers(): RoomMemberEvent[] {
        return this.room.state.filter(e => e.type === "m.room.member").map(e => <RoomMemberEvent>e);
    }

    public get senderDisplayName(): string {
        return User.getDisambiguatedName(this.event.sender, this.getRoomMembers());
    }

    public get timestamp(): string {
        return moment(this.event.origin_server_ts).fromNow();
    }

    public get fullTimestamp(): string {
        return moment(this.event.origin_server_ts).format(); // TODO: Actually format the timestamp
    }
}