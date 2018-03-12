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
import { Room } from "../../../models/matrix/dto/room";
import { MediaService } from "../../../services/matrix/media.service";

@Component({
    selector: "my-room-avatar",
    templateUrl: "../avatar.component.html",
    styleUrls: ["../avatar.component.scss"],
})
export class RoomAvatarComponent extends AvatarComponent {

    @Input() public room: Room;

    constructor(media: MediaService) {
        super(media)
    }

    public get mxcUrl(): string {
        return this.room ? this.room.avatarMxc : null;
    }

    public get displayName(): string {
        return this.room ? this.room.displayName : "Empty Room";
    }
}
