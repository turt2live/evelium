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
import { AvatarComponent } from "../avatar.component";
import { RoomMemberEvent } from "../../../models/matrix/events/room/state/m.room.member";
import { User } from "../../../models/matrix/dto/user";
import { MediaService } from "../../../services/matrix/media.service";
import { Room } from "../../../models/matrix/dto/room";

@Component({
    selector: "my-room-member-avatar",
    templateUrl: "../avatar.component.html",
    styleUrls: ["../avatar.component.scss"],
})
export class RoomMemberAvatarComponent extends AvatarComponent {

    @Input() public userId: string;
    @Input() public room: Room;
    @Input() public forcedAvatarUrl: string;
    @Input() public forcedDisplayName: string;

    constructor(media: MediaService) {
        super(media)
    }

    public get mxcUrl(): string {
        if (this.forcedAvatarUrl) return this.forcedAvatarUrl;
        if (!this.room) return null;

        const memberEvent = <RoomMemberEvent>this.room.state.find(e => e.type === "m.room.member" && e.state_key === this.userId);
        if (!memberEvent || !memberEvent.content) return null;

        if (memberEvent.content.membership === "leave" || memberEvent.content.membership === "ban")
            return memberEvent.unsigned && memberEvent.unsigned.prev_content ? memberEvent.unsigned.prev_content.avatar_url : null;

        return memberEvent.content.avatar_url;
    }

    public get displayName(): string {
        if (this.forcedDisplayName) return this.forcedDisplayName;
        if (!this.room) return null;

        const members = this.room.state.filter(e => e.type === "m.room.member").map(e => <RoomMemberEvent>e);
        return User.getDisambiguatedName(this.userId, members);
    }
}
