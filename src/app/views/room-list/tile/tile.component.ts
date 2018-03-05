import { Component, Input } from "@angular/core";
import { MatrixRoom } from "../../../models/matrix/dto/room";
import { Router } from "@angular/router";

@Component({
    selector: "my-room-list-tile",
    templateUrl: "./tile.component.html",
    styleUrls: ["./tile.component.scss"]
})
export class RoomListTileComponent {

    @Input() public room: MatrixRoom;
    @Input() public isActive: boolean;

    constructor(private router: Router) {
    }

    public onTileClick(): void {
        this.router.navigate(['/app/rooms/', this.room.id]);
    }
}