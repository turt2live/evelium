import { Component, EventEmitter, Input, Output } from "@angular/core";
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
    @Input() public defaultNumShown = -1;
    @Input() public activeRoom: MatrixRoom;
    @Output() public onRoomSelected = new EventEmitter<MatrixRoom>();

    public fullList = false;
    public numHidden = 0;
    public numExtraShown = 0;
    public collapsed = false;

    constructor() {
    }

    public filteredRooms(): MatrixRoom[] {
        let filteredRooms = this.rooms;
        if (this.nameFilter) {
            filteredRooms = this.rooms.filter(r => r.displayName.toLowerCase().indexOf(this.nameFilter.toLowerCase()) !== -1);
        }

        if (this.defaultNumShown > 0 && !this.fullList) {
            this.numHidden = Math.max(0, filteredRooms.length - this.defaultNumShown);
            this.numExtraShown = 0;
            filteredRooms = filteredRooms.slice(0, this.defaultNumShown);
        } else if (this.defaultNumShown > 0) {
            this.numExtraShown = Math.max(0, filteredRooms.length - this.defaultNumShown);
            this.numHidden = 0;
        }

        return filteredRooms;
    }

    public onTileClick(room: MatrixRoom) {
        this.onRoomSelected.emit(room);
    }
}