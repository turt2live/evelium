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

@Component({
    selector: "my-room-list-tag",
    templateUrl: "./tag.component.html",
    styleUrls: ["./tag.component.scss"]
})
export class RoomListTagComponent {

    @Input() public rooms: Room[];
    @Input() public name: string;
    @Input() public nameFilter: string;
    @Input() public defaultNumShown = -1;
    @Input() public activeRoom: Room;

    public fullList = false;
    public numHidden = 0;
    public numExtraShown = 0;
    public collapsed = false;

    constructor() {
    }

    public filteredRooms(): Room[] {
        let filteredRooms = this.rooms;
        if (this.nameFilter) {
            filteredRooms = this.rooms.filter(r => r.displayName.toLowerCase().indexOf(this.nameFilter.toLowerCase()) !== -1);
        }

        if (this.defaultNumShown > 0 && !this.fullList) {
            this.numHidden = Math.max(0, filteredRooms.length - this.defaultNumShown);
            this.numExtraShown = 0;
            filteredRooms = filteredRooms.slice(0, this.defaultNumShown);
        } else if (this.defaultNumShown > 0) {
            this.numExtraShown = Math.max(0, filteredRooms.length - this.defaultNumShown);
            this.numHidden = 0;
        }

        return filteredRooms;
    }
}