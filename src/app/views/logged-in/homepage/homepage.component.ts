import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MatrixRoomService } from "../../../services/matrix/room.service";
import { MatrixSyncService } from "../../../services/matrix/sync.service";

@Component({
    templateUrl: "./homepage.component.html",
    styleUrls: ["./homepage.component.scss"]
})
export class HomepageComponent implements OnInit {

    constructor(private router: Router, private sync: MatrixSyncService, private rooms: MatrixRoomService) {
    }

    public ngOnInit() {
        let navigated = false;
        const roomsSubscription = this.sync.getStream("self.room.join").subscribe(() => {
            if (navigated) return;

            navigated = true;
            const room = this.rooms.getAllRooms()[0];
            this.router.navigate(['app', 'rooms', room.id]);

            if (roomsSubscription) roomsSubscription.unsubscribe();
        });
    }
}