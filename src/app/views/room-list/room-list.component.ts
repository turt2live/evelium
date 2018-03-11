import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { Room } from "../../models/matrix/dto/room";
import { RoomService } from "../../services/matrix/room.service";

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

    constructor(private rooms: RoomService) {
    }

    public ngOnInit() {
        this.addTag(DIRECT_TAG_ID, "Direct chats", 5);
        this.addTag(ROOMS_TAG_ID, "Rooms", 10);

        this.joinedRoomsSubscription = this.rooms.joined.subscribe(this.onRoom.bind(this));
        // TODO: Need a subscription for when the Direct Chats map is updated

        this.rooms.getAll().then(rooms => rooms.forEach(r => this.onRoom(r)));
    }

    public ngOnDestroy() {
        if (this.joinedRoomsSubscription) this.joinedRoomsSubscription.unsubscribe();
    }

    private onRoom(room: Room): void {
        const tag = this.tagsById[room.isDirect ? DIRECT_TAG_ID : ROOMS_TAG_ID];
        tag.rooms.push(room);
    }

    // private onRoomUpdated(event: RoomUpdatedEvent): void {
    //     if (event.property !== "isDirect") return;
    //
    //     const roomsTag = this.tagsById[ROOMS_TAG_ID];
    //     const directTag = this.tagsById[DIRECT_TAG_ID];
    //
    //     const oldTag = event.room.isDirect ? roomsTag : directTag;
    //     const newTag = event.room.isDirect ? directTag : roomsTag;
    //
    //     let idx = oldTag.rooms.indexOf(event.room);
    //     if (idx !== -1) oldTag.rooms.splice(idx, 1);
    //
    //     idx = newTag.rooms.indexOf(event.room);
    //     if (idx === -1) newTag.rooms.push(event.room);
    // }

    private addTag(id: string, name: string, defaultNumShown = 0 /* 0 == all */): TaggedRoomList {
        const list: TaggedRoomList = {name: name, rooms: [], defaultNumShown: defaultNumShown};
        this.tags.push(list);
        this.tagsById[id] = list;
        return list;
    }
}