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
import { RoomMemberEvent } from "../../../models/matrix/events/room/state/m.room.member";
import { User } from "../../../models/matrix/dto/user";
import { Room } from "../../../models/matrix/dto/room";

@Component({
    selector: "my-member-pill",
    templateUrl: "./member.component.html",
    styleUrls: ["./member.component.scss"]
})
export class MemberPillComponent {

    @Input() public room: Room;
    @Input() public userId: string;
    @Input() public forcedAvatarUrl: string;
    @Input() public forcedDisplayName: string;

    constructor() {
    }

    private getRoomMembers(): RoomMemberEvent[] {
        return this.room.state.filter(e => e.type === "m.room.member").map(e => <RoomMemberEvent>e);
    }

    public get memberEvent(): RoomMemberEvent {
        return this.getRoomMembers().find(e => e.state_key === this.userId);
    }

    public get displayName(): string {
        return User.getDisambiguatedName(this.userId, this.getRoomMembers());
    }
}