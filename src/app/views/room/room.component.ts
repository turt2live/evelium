import { Component, Input } from "@angular/core";
import { MatrixRoom } from "../../models/matrix/dto/room";

@Component({
    selector: "my-room",
    templateUrl: "./room.component.html",
    styleUrls: ["./room.component.scss"]
})
export class RoomComponent {

    @Input() public room: MatrixRoom;

    constructor() {
    }
}