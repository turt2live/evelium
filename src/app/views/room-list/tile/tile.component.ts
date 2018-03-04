import { Component, Input } from "@angular/core";
import { MatrixRoom } from "../../../models/matrix/dto/room";

@Component({
    selector: "my-room-list-tile",
    templateUrl: "./tile.component.html",
    styleUrls: ["./tile.component.scss"]
})
export class RoomListTileComponent {

    @Input() public room: MatrixRoom;

    constructor() {
    }
}