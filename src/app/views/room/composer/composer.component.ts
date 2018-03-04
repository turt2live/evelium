import { Component, Input } from "@angular/core";
import { MatrixRoom } from "../../../models/matrix/dto/room";
import { MatrixEventService } from "../../../services/matrix/event.service";

@Component({
    selector: "my-room-message-composer",
    templateUrl: "./composer.component.html",
    styleUrls: ["./composer.component.scss"]
})
export class RoomMessageComposerComponent {

    @Input() public room: MatrixRoom;

    public message: string;

    constructor(private events: MatrixEventService) {
    }

    public sendMessage() {
        if (!this.message || !this.message.trim()) return; // don't send whitespace

        const content = {
            msgtype: "m.text",
            body: this.message,
        };

        this.message = "";
        this.events.sendEvent("m.room.message", content, this.room).then(() => {
            console.log("Message sent!");
        }).catch(err => {
            console.error(err);
            // TODO: Some sort of "Failed to send" status
        });
    }
}