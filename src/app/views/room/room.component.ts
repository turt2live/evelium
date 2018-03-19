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

import {
    AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, QueryList, ViewChild,
    ViewChildren
} from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { PerfectScrollbarDirective } from "ngx-perfect-scrollbar";
import { ReadReceipts, Room, UserReadReceipt } from "../../models/matrix/dto/room";
import { RoomEvent } from "../../models/matrix/events/room/room-event";
import { EventTileComponent } from "../../elements/event-tiles/event-tile.component";

export interface RoomTimelineEvent {
    event: RoomEvent;
    previous: RoomTimelineEvent; // nullable
}

@Component({
    selector: "my-room",
    templateUrl: "./room.component.html",
    styleUrls: ["./room.component.scss"]
})
export class RoomComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

    @ViewChild(PerfectScrollbarDirective) public timelineScrollDirective: PerfectScrollbarDirective;
    @ViewChildren('eventTiles') public eventTiles: QueryList<EventTileComponent>;

    @Input() public room: Room;

    public timeline: RoomTimelineEvent[] = [];

    private onBottom = true;
    private readReceipts: ReadReceipts = {};

    private roomSubscription: Subscription;
    private eventTilesSubscription: Subscription;
    private readReceiptsSubscription: Subscription;

    constructor() {
    }

    public ngOnInit() {
        if (this.room) {
            this.roomSubscription = this.room.timeline.subscribe(this.onTimelineEvent.bind(this));
            this.readReceiptsSubscription = this.room.readReceipts.subscribe(this.onReadReceipts.bind(this));
        }
    }

    public ngOnChanges() {
        this.timeline = [];
        this.readReceipts = {};

        if (this.roomSubscription) this.roomSubscription.unsubscribe();
        if (this.readReceiptsSubscription) this.readReceiptsSubscription.unsubscribe();

        // HACK: We shouldn't have to do this - why can the event tile subscription not handle this case?
        setTimeout(() => {
            if (this.room) {
                this.roomSubscription = this.room.timeline.subscribe(this.onTimelineEvent.bind(this));
                this.readReceiptsSubscription = this.room.readReceipts.subscribe(this.onReadReceipts.bind(this));
            }
        }, 1);
    }

    public ngOnDestroy() {
        if (this.roomSubscription) this.roomSubscription.unsubscribe();
        if (this.eventTilesSubscription) this.eventTilesSubscription.unsubscribe();
    }

    public ngAfterViewInit() {
        this.eventTilesSubscription = this.eventTiles.changes.subscribe(() => {
            // console.log("New tile rendered: " + this.onBottom);
            if (this.onBottom && this.timelineScrollDirective) this.timelineScrollDirective.scrollToBottom();
        });
    }

    private onTimelineEvent(event: RoomEvent): void {
        this.timeline.push({
            event: event,
            previous: this.timeline.length > 0 ? this.timeline[this.timeline.length - 1] : null,
        });
    }

    private onReadReceipts(newReceipts: ReadReceipts): void {
        this.readReceipts = newReceipts;
    }

    public getReadReceipts(event: RoomTimelineEvent): UserReadReceipt[] {
        if (!this.readReceipts) return [];
        return this.readReceipts[event.event.event_id];
    }

    public onComposerResize() {
        if (this.onBottom && this.timelineScrollDirective) this.timelineScrollDirective.scrollToBottom();
    }

    public onScrollUp() {
        // console.log("Scrolled off bottom");
        this.onBottom = false;
    }

    public onEndReached() {
        // console.log("Scrolled to bottom");
        this.onBottom = true;
    }
}
