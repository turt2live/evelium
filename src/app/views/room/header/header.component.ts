import { Component, Input } from "@angular/core";
import { MatrixRoom } from "../../../models/matrix/dto/room";

@Component({
    selector: "my-room-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"]
})
export class RoomHeaderComponent {

    @Input() public room: MatrixRoom;

    constructor() {
    }
}