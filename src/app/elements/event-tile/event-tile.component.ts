import { Component, Input } from "@angular/core";
import { RoomEvent } from "../../models/matrix/events/room/room-event";
import { MatrixRoom } from "../../models/matrix/dto/room";
import { RoomMemberEvent } from "../../models/matrix/events/room/state/m.room.member";
import { User } from "../../models/matrix/dto/user";
import moment = require("moment");

@Component({
    selector: "my-event-tile",
    templateUrl: "./event-tile.component.html",
    styleUrls: ["./event-tile.component.scss"]
})
export class EventTileComponent {

    @Input() public event: RoomEvent;
    @Input() public room: MatrixRoom;
    @Input() public showSender = true;

    constructor() {
    }

    private getRoomMembers(): RoomMemberEvent[] {
        return this.room.state.filter(e => e.type === "m.room.member").map(e => <RoomMemberEvent>e);
    }

    public get senderDisplayName(): string {
        return User.getDisambiguatedName(this.event.sender, this.getRoomMembers());
    }

    public get timestamp(): string {
        return moment(this.event.origin_server_ts).fromNow();
    }

    public get fullTimestamp(): string {
        return moment(this.event.origin_server_ts).format(); // TODO: Actually format the timestamp
    }
}