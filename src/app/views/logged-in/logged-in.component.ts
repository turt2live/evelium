import { Component, OnInit } from "@angular/core";
import { SyncService } from "../../services/matrix/sync.service";
import { RoomService } from "../../services/matrix/room.service";

@Component({
    templateUrl: "./logged-in.component.html",
    styleUrls: ["./logged-in.component.scss"]
})
export class LoggedInComponent implements OnInit {

    public receivedRoomList = false;

    constructor(private sync: SyncService, private rooms: RoomService) {
    }

    public ngOnInit() {
        this.sync.startSyncing();
        const roomSubscription = this.rooms.joined.subscribe(() => {
            this.receivedRoomList = true;
            roomSubscription.unsubscribe(); // we don't care anymore
        });
    }
}