import { Component, Input } from "@angular/core";
import { Room } from "../../../models/matrix/dto/room";
import { SimpleRoomMessageEvent } from "../../../models/matrix/events/room/m.room.message";

@Component({
    selector: "my-room-message-composer",
    templateUrl: "./composer.component.html",
    styleUrls: ["./composer.component.scss"]
})
export class RoomMessageComposerComponent {

    @Input() public room: Room;

    public message: string;

    constructor() {
    }

    public sendMessage() {
        if (!this.message || !this.message.trim()) return; // don't send whitespace

        const event = new SimpleRoomMessageEvent(this.message);
        this.message = "";

        this.room.timeline.next(event);
    }
}