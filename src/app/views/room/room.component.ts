import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatrixRoom, RoomUpdatedEvent } from "../../models/matrix/dto/room";
import { Subscription } from "rxjs/Subscription";
import { PerfectScrollbarDirective } from "ngx-perfect-scrollbar";

@Component({
    selector: "my-room",
    templateUrl: "./room.component.html",
    styleUrls: ["./room.component.scss"]
})
export class RoomComponent implements OnInit, OnDestroy {

    @ViewChild(PerfectScrollbarDirective) public timelineScrollDirective: PerfectScrollbarDirective;

    @Input() public room: MatrixRoom;

    private roomSubscription: Subscription;

    constructor() {
    }

    public ngOnInit() {
        this.roomSubscription = MatrixRoom.UPDATED_STREAM.subscribe(this.onRoomUpdated.bind(this));
    }

    public ngOnDestroy() {
        if (this.roomSubscription) this.roomSubscription.unsubscribe();
    }

    private onRoomUpdated(event: RoomUpdatedEvent): void {
        if (!this.room || event.room.id !== this.room.id) return;
        console.log("Room " + event.room.id + " updated");
        if (event.property !== "timeline" && event.property !== "pendingEvents") return;
        console.log("Room " + event.room.id + " TIMELINE updated");
        if (this.timelineScrollDirective) this.timelineScrollDirective.scrollToBottom();
    }
}