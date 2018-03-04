import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { MatrixSyncService } from "../../services/matrix/sync.service";
import { MatrixRoom, RoomUpdatedEvent } from "../../models/matrix/dto/room";
import { Subscription } from "rxjs/Subscription";

interface TaggedRoomList {
    name: string;
    rooms: MatrixRoom[];
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

    @Input() public activeRoom: MatrixRoom;
    @Output() public onRoomSelected = new EventEmitter<MatrixRoom>();

    public tags: TaggedRoomList[] = [];
    public search: string;

    private tagsById: { [id: string]: TaggedRoomList } = {};

    private newRoomSubscription: Subscription;
    private roomChangedSubscription: Subscription;

    constructor(private sync: MatrixSyncService) {
    }

    public ngOnInit() {
        this.addTag(DIRECT_TAG_ID, "Direct chats", 5);
        this.addTag(ROOMS_TAG_ID, "Rooms", 10);

        this.newRoomSubscription = this.sync.getStream<MatrixRoom>("self.room.join").subscribe(this.onNewRoom.bind(this));
        this.roomChangedSubscription = MatrixRoom.UPDATED_STREAM.subscribe(this.onRoomUpdated.bind(this));
    }

    public ngOnDestroy() {
        if (this.newRoomSubscription) this.newRoomSubscription.unsubscribe();
        if (this.roomChangedSubscription) this.roomChangedSubscription.unsubscribe();
    }

    private onNewRoom(room: MatrixRoom): void {
        const tag = this.tagsById[room.isDirect ? DIRECT_TAG_ID : ROOMS_TAG_ID];
        tag.rooms.push(room);
    }

    private onRoomUpdated(event: RoomUpdatedEvent): void {
        if (event.property !== "isDirect") return;

        const roomsTag = this.tagsById[ROOMS_TAG_ID];
        const directTag = this.tagsById[DIRECT_TAG_ID];

        const oldTag = event.room.isDirect ? roomsTag : directTag;
        const newTag = event.room.isDirect ? directTag : roomsTag;

        let idx = oldTag.rooms.indexOf(event.room);
        if (idx !== -1) oldTag.rooms.splice(idx, 1);

        idx = newTag.rooms.indexOf(event.room);
        if (idx === -1) newTag.rooms.push(event.room);
    }

    private addTag(id: string, name: string, defaultNumShown = 0 /* 0 == all */): TaggedRoomList {
        const list: TaggedRoomList = {name: name, rooms: [], defaultNumShown: defaultNumShown};
        this.tags.push(list);
        this.tagsById[id] = list;
        return list;
    }
}