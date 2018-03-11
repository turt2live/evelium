import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { PerfectScrollbarDirective } from "ngx-perfect-scrollbar";
import { Room } from "../../models/matrix/dto/room";
import { RoomEvent } from "../../models/matrix/events/room/room-event";

@Component({
    selector: "my-room",
    templateUrl: "./room.component.html",
    styleUrls: ["./room.component.scss"]
})
export class RoomComponent implements OnInit, OnDestroy, OnChanges {

    @ViewChild(PerfectScrollbarDirective) public timelineScrollDirective: PerfectScrollbarDirective;

    @Input() public room: Room;

    public timeline: RoomEvent[] = [];

    private roomSubscription: Subscription;

    constructor() {
    }

    public ngOnInit() {
        if (this.room) this.roomSubscription = this.room.timeline.subscribe(this.onTimelineEvent.bind(this));
    }

    public ngOnChanges() {
        if (this.roomSubscription) this.roomSubscription.unsubscribe();
        if (this.room) this.roomSubscription = this.room.timeline.subscribe(this.onTimelineEvent.bind(this));
    }

    public ngOnDestroy() {
        if (this.roomSubscription) this.roomSubscription.unsubscribe();
    }

    private onTimelineEvent(event: RoomEvent): void {
        this.timeline.push(event);
        if (this.timelineScrollDirective) this.timelineScrollDirective.scrollToBottom();
    }
}