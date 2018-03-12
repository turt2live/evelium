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

import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { Room } from "../../models/matrix/dto/room";
import { RoomService, UpdatedRoomTags } from "../../services/matrix/room.service";

interface TaggedRoomList {
    name: string;
    rooms: Room[];
    defaultNumShown: number;
}

const ROOMS_TAG_ID = "io.evelium.rooms";
const DIRECT_TAG_ID = "io.evelium.direct";

@Component({
    selector: "my-room-list",
    templateUrl: "./room-list.component.html",
    styleUrls: ["./room-list.component.scss"]
})
export class RoomListComponent implements OnInit, OnDestroy {

    @Input() public activeRoom: Room;
    public tags: TaggedRoomList[] = [];
    public search: string;

    private tagsById: { [id: string]: TaggedRoomList } = {};

    private joinedRoomsSubscription: Subscription;
    private roomTagSubscription: Subscription;

    constructor(private rooms: RoomService) {
    }

    public ngOnInit() {
        this.addTag(DIRECT_TAG_ID, "Direct chats", 5);
        this.addTag(ROOMS_TAG_ID, "Rooms", 10);

        this.joinedRoomsSubscription = this.rooms.joined.subscribe(this.onRoom.bind(this));
        this.roomTagSubscription = this.rooms.tagged.subscribe(this.onTags.bind(this));

        this.rooms.getAll().then(rooms => rooms.forEach(r => this.onRoom(r)));
    }

    public ngOnDestroy() {
        if (this.joinedRoomsSubscription) this.joinedRoomsSubscription.unsubscribe();
        if (this.roomTagSubscription) this.roomTagSubscription.unsubscribe();
    }

    private onRoom(room: Room): void {
        const tag = this.tagsById[room.isDirect ? DIRECT_TAG_ID : ROOMS_TAG_ID];
        if (!tag.rooms.find(r => r.roomId === room.roomId))
            tag.rooms.push(room);
    }

    private onTags(event: UpdatedRoomTags): void {
        const roomsTag = this.tagsById[ROOMS_TAG_ID];
        const directTag = this.tagsById[DIRECT_TAG_ID];

        roomsTag.rooms = event.other;
        directTag.rooms = event.direct;
    }

    private addTag(id: string, name: string, defaultNumShown = 0 /* 0 == all */): TaggedRoomList {
        const list: TaggedRoomList = {name: name, rooms: [], defaultNumShown: defaultNumShown};
        this.tags.push(list);
        this.tagsById[id] = list;
        return list;
    }
}