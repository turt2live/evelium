import { Component } from "@angular/core";
import { MatrixSyncService } from "../../services/matrix/sync.service";
import { MatrixRoom } from "../../models/matrix/dto/room";

interface TaggedRoomList {
    name: string;
    rooms: MatrixRoom[];
}

@Component({
    selector: "my-room-list",
    templateUrl: "./room-list.component.html",
    styleUrls: ["./room-list.component.scss"]
})
export class RoomListComponent {

    public tags: TaggedRoomList[] = [];
    public search: string;

    private tagsById: { [id: string]: TaggedRoomList } = {};

    constructor(sync: MatrixSyncService) {
        const roomsTag = this.addTag("io.evelium.rooms", "Rooms");
        sync.getStream<MatrixRoom>("self.room.join").subscribe(room => roomsTag.rooms.push(room));
    }

    private addTag(id: string, name: string): TaggedRoomList {
        const list: TaggedRoomList = {name: name, rooms: []};
        this.tags.push(list);
        this.tagsById[id] = list;
        return list;
    }
}