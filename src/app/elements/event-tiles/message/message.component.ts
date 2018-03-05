import { Component } from "@angular/core";
import { RoomMemberEvent } from "../../../models/matrix/events/room/state/m.room.member";
import { User } from "../../../models/matrix/dto/user";
import { DynamicEventTileComponent } from "../event-tile.component";
import moment = require("moment");

@Component({
    selector: "my-message-event-tile",
    templateUrl: "./message.component.html",
    styleUrls: ["./message.component.scss"]
})
export class MessageEventTileComponent extends DynamicEventTileComponent {

    constructor() {
        super();
    }

    public get showSender(): boolean {
        if (this.previousEvent) {
            return this.previousEvent.sender !== this.event.sender || this.previousEvent.type !== "m.room.message";
        } else return true;
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