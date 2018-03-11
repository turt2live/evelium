import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Room } from "../../../models/matrix/dto/room";
import { RoomService } from "../../../services/matrix/room.service";

@Component({
    templateUrl: "./room-interface.component.html",
    styleUrls: ["./room-interface.component.scss"]
})
export class RoomInterfaceComponent implements OnInit, OnDestroy {

    public activeRoom: Room;

    private paramsSubscription: Subscription;

    constructor(private activeRoute: ActivatedRoute, private rooms: RoomService) {
    }

    public ngOnInit() {
        this.paramsSubscription = this.activeRoute.params.subscribe(params => {
            // TODO: Handle case of room not found
            this.rooms.getById((params || {})['roomId']).then(r => this.activeRoom = r);
        });
    }

    public ngOnDestroy() {
        if (this.paramsSubscription) this.paramsSubscription.unsubscribe();
    }
}