import { Component, Input } from "@angular/core";
import { MatrixRoom } from "../../../models/matrix/dto/room";

@Component({
    selector: "my-room-list-tag",
    templateUrl: "./tag.component.html",
    styleUrls: ["./tag.component.scss"]
})
export class RoomListTagComponent {

    @Input() public rooms: MatrixRoom[];
    @Input() public name: string;
    @Input() public nameFilter: string;

    constructor() {
    }

    public filteredRooms(): MatrixRoom[] {
        if (this.nameFilter) {
            return this.rooms.filter(r => r.displayName.toLowerCase().indexOf(this.nameFilter.toLowerCase()) !== -1);
        }

        return this.rooms;
    }
}