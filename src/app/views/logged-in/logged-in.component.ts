import { Component, OnInit } from "@angular/core";
import { MatrixSyncService } from "../../services/matrix/sync.service";
import { MatrixRoomService } from "../../services/matrix/room.service";

@Component({
    templateUrl: "./logged-in.component.html",
    styleUrls: ["./logged-in.component.scss"]
})
export class LoggedInComponent implements OnInit {

    public receivedRoomList = false;

    constructor(private sync: MatrixSyncService, public rooms: MatrixRoomService) {
    }

    public ngOnInit() {
        this.sync.startSyncing();
        const roomSubscription = this.sync.getStream("self.room.list").subscribe(() => {
            this.receivedRoomList = true;
            roomSubscription.unsubscribe(); // we don't care anymore
        });
    }
}