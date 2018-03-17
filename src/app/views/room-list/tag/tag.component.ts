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

import { Component, Input, OnChanges } from "@angular/core";
import { Room } from "../../../models/matrix/dto/room";
import { Subscription } from "rxjs/Subscription";
import * as _ from 'lodash';

interface RoomEntry {
    room: Room;
    lastEvent: number;
    timelineSubscription: Subscription;
}

@Component({
    selector: "my-room-list-tag",
    templateUrl: "./tag.component.html",
    styleUrls: ["./tag.component.scss"]
})
export class RoomListTagComponent implements OnChanges {

    @Input() public rooms: Room[];
    @Input() public name: string;
    @Input() public nameFilter: string;
    @Input() public defaultNumShown = -1;
    @Input() public activeRoom: Room;

    public fullList = false;
    public numHidden = 0;
    public numExtraShown = 0;
    public collapsed = false;
    public orderedRooms: RoomEntry[] = [];

    constructor() {
    }

    public ngOnChanges() {
        // Drop any rooms that left
        const toRemove = _.filter(this.orderedRooms, r => this.rooms.indexOf(r.room) === -1);
        toRemove.forEach(r => {
            _.remove(this.orderedRooms, r);
            r.timelineSubscription.unsubscribe();
        });

        // Add in any new rooms
        const orderedRoomObjects = this.orderedRooms.map(r => r.room);
        const toAdd = _.filter(this.rooms, r => orderedRoomObjects.indexOf(r) === -1);
        toAdd.forEach(r => this.trackRoom(r));
    }

    private trackRoom(room: Room) {
        const entry: RoomEntry = {
            timelineSubscription: null,
            room: room,
            lastEvent: 0,
        };
        this.orderedRooms.push(entry);
        entry.timelineSubscription = room.timeline.subscribe(() => {
            const fakeEntry = <RoomEntry>{lastEvent: new Date().getTime()};

            const nowIndex = this.orderedRooms.indexOf(entry);
            const targetIndex = _.sortedIndexBy(this.orderedRooms, fakeEntry, e => -e.lastEvent);
            if (nowIndex !== targetIndex) {
                _.remove(this.orderedRooms, entry);
                this.orderedRooms.splice(targetIndex, 0, entry);
            }

            entry.lastEvent = new Date().getTime();
        });
    }

    public filteredRooms(): Room[] {
        let filteredRooms = this.orderedRooms;
        if (this.nameFilter) {
            filteredRooms = this.orderedRooms.filter(r => r.room.displayName.toLowerCase().indexOf(this.nameFilter.toLowerCase()) !== -1);
        }

        if (this.defaultNumShown > 0 && !this.fullList) {
            this.numHidden = Math.max(0, filteredRooms.length - this.defaultNumShown);
            this.numExtraShown = 0;
            filteredRooms = filteredRooms.slice(0, this.defaultNumShown);
        } else if (this.defaultNumShown > 0) {
            this.numExtraShown = Math.max(0, filteredRooms.length - this.defaultNumShown);
            this.numHidden = 0;
        }

        return filteredRooms.map(r => r.room);
    }
}