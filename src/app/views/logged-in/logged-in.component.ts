import { Component, OnInit } from "@angular/core";
import { MatrixSyncService } from "../../services/matrix/sync.service";
import { MatrixRoomService } from "../../services/matrix/room.service";
import { MatrixRoom } from "../../models/matrix/dto/room";

@Component({
    templateUrl: "./logged-in.component.html",
    styleUrls: ["./logged-in.component.scss"]
})
export class LoggedInComponent implements OnInit {

    public receivedRoomList = false;
    public activeRoom: MatrixRoom;

    constructor(private sync: MatrixSyncService, private rooms: MatrixRoomService) {
        this.sync.startSyncing();
    }

    public ngOnInit() {
        const roomSubscription = this.sync.getStream("self.room.join").subscribe(() => {
            this.receivedRoomList = true;
            roomSubscription.unsubscribe(); // we don't care anymore

            // TODO: Replace this logic with a homepage (#43)
            const allRooms = this.rooms.getAllRooms();
            this.activeRoom = allRooms[0];
        });
    }

    public onRoomSelected(room: MatrixRoom): void {
        if (this.activeRoom && this.activeRoom.id === room.id) return; // Don't change to a room we're already in

        console.log("Changing room to " + (room ? room.id : "null"));
        this.activeRoom = room;
    }
}