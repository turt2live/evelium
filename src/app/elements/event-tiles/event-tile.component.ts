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
    Component, ComponentFactoryResolver, ComponentRef, Input, OnDestroy, OnInit, Output, Type, ViewChild,
    ViewContainerRef
} from "@angular/core";
import { MessageEventTileComponent } from "./message/message.component";
import { MemberEventTileComponent } from "./member/member.component";
import { EventTileComponentBase } from "./event-tile.component.base";
import { Room } from "../../models/matrix/dto/room";
import { RoomTimelineEvent } from "../../views/room/room.component";

interface TileMap {
    [eventType: string]: Type<EventTileComponentBase>;
}

let cachedTileMap: TileMap;

@Component({
    selector: "my-event-tile",
    templateUrl: "./event-tile.component.html",
    styleUrls: ["./event-tile.component.scss"]
})
export class EventTileComponent implements OnInit, OnDestroy {

    @ViewChild('wrapper', {read: ViewContainerRef}) public wrapper: ViewContainerRef;

    @Input() public timelineEvent: RoomTimelineEvent;
    @Input() public room: Room;
    @Output() public renderable = true;

    private componentRef: ComponentRef<EventTileComponentBase>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    }

    public ngOnInit() {
        if (!this.timelineEvent || !this.room) return;

        const componentType = this.tileMap[this.timelineEvent.event.type];
        if (!componentType) {
            console.warn("Cannot render event of type " + this.timelineEvent.event.type);
            this.renderable = false;
            return;
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
        this.componentRef = this.wrapper.createComponent(factory);

        this.componentRef.instance.timelineEvent = this.timelineEvent;
        this.componentRef.instance.room = this.room;
    }

    public ngOnDestroy() {
        if (this.componentRef) {
            this.componentRef.destroy();
            this.componentRef = null; // just to clean up
        }
    }

    private get tileMap(): TileMap {
        // This is done as a instance getter with an external cache property to ensure that
        // the component classes are fully set up by the time we need them. If this map
        // was created as a regular static property then we'd have the issue of components
        // being seen as undefined.
        if (!cachedTileMap) {
            cachedTileMap = {
                'm.room.message': MessageEventTileComponent,
                'm.room.member': MemberEventTileComponent,
            };
        }

        return cachedTileMap;
    }
}