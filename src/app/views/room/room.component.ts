/*
 *     Evelium - A matrix client
 *     Copyright (C)  2018 Travis Ralston
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
        this.timeline = [];
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