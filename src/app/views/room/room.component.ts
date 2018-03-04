import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatrixRoom, RoomUpdatedEvent } from "../../models/matrix/dto/room";
import { Subscription } from "rxjs/Subscription";
import { PerfectScrollbarDirective } from "ngx-perfect-scrollbar";
import { RoomEvent } from "../../models/matrix/events/room/room-event";

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
        if (event.property !== "timeline" && event.property !== "pendingEvents") return;
        if (this.timelineScrollDirective) this.timelineScrollDirective.scrollToBottom();
    }

    public shouldShowSender(event: RoomEvent): boolean {
        const idx = this.room.timeline.indexOf(event);
        if (idx > 0) {
            const previousEvent = this.room.timeline[idx - 1];
            return previousEvent.sender !== event.sender;
        } else return true;
    }
}