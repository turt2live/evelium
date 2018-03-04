import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatrixRoom } from "../../../models/matrix/dto/room";
import { MatrixMediaService } from "../../../services/matrix/media.service";

@Component({
    selector: "my-room-list-tile",
    templateUrl: "./tile.component.html",
    styleUrls: ["./tile.component.scss"]
})
export class RoomListTileComponent {

    @Input() public room: MatrixRoom;
    @Input() public isActive: boolean;
    @Output() public onClick = new EventEmitter();

    constructor(public media: MatrixMediaService) {
    }

    public onTileClick(): void {
        this.onClick.emit();
    }
}