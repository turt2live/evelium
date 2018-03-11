import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { RoomService } from "../../../services/matrix/room.service";

@Component({
    templateUrl: "./homepage.component.html",
    styleUrls: ["./homepage.component.scss"]
})
export class HomepageComponent implements OnInit {

    constructor(private router: Router, private rooms: RoomService) {
    }

    public ngOnInit() {
        let navigated = false;
        const roomsSubscription = this.rooms.joined.subscribe(() => {
            if (navigated) return;

            navigated = true;
            this.rooms.getAll().then(rooms => this.router.navigate(['app', 'rooms', rooms[0].roomId]));

            if (roomsSubscription) roomsSubscription.unsubscribe();
        });
    }
}