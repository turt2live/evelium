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
import { TextBody_MessageEventTileComponent } from "../text/text.component";
import { User } from "../../../../models/matrix/dto/user";
import { RoomMemberEvent } from "../../../../models/matrix/events/room/state/m.room.member";

@Component({
    selector: "my-emote-body-message-event-tile",
    templateUrl: "./emote.component.html",
    styleUrls: ["./emote.component.scss"]
})
export class EmoteBody_MessageEventTileComponent extends TextBody_MessageEventTileComponent {

    constructor() {
        super();
    }

    // TODO: This is a lot of code duplication from the message event tile - surely we can make this simpler?

    private getRoomMembers(): RoomMemberEvent[] {
        return this.room.state.filter(e => e.type === "m.room.member").map(e => <RoomMemberEvent>e);
    }

    public get senderDisplayName(): string {
        return User.getDisambiguatedName(this.event.sender, this.getRoomMembers());
    }
}