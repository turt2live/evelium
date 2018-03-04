import { Component } from "@angular/core";
import { MatrixSyncService } from "../../services/matrix/sync.service";

@Component({
    templateUrl: "./logged-in.component.html",
    styleUrls: ["./logged-in.component.scss"]
})
export class LoggedInComponent {

    public receivedRoomList = false;

    constructor(sync: MatrixSyncService) {
        sync.startSyncing();
        sync.getStream("self.room.join").subscribe(() => this.receivedRoomList = true);
    }
}