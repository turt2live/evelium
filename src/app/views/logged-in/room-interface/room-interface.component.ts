import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatrixRoomService } from "../../../services/matrix/room.service";
import { MatrixRoom } from "../../../models/matrix/dto/room";
import { Subscription } from "rxjs/Subscription";

@Component({
    templateUrl: "./room-interface.component.html",
    styleUrls: ["./room-interface.component.scss"]
})
export class RoomInterfaceComponent implements OnInit, OnDestroy {

    public activeRoom: MatrixRoom;

    private paramsSubscription: Subscription;

    constructor(private activeRoute: ActivatedRoute, private rooms: MatrixRoomService) {
    }

    public ngOnInit() {
        this.paramsSubscription = this.activeRoute.params.subscribe(params => {
            this.activeRoom = this.rooms.getRoom((params || {})['roomId']);
        });
    }

    public ngOnDestroy() {
        if (this.paramsSubscription) this.paramsSubscription.unsubscribe();
    }
}