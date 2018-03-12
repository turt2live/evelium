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
    Component, ComponentFactoryResolver, ComponentRef, Input, OnDestroy, OnInit, Type, ViewChild,
    ViewContainerRef
} from "@angular/core";
import { MessageEventTileComponent } from "./message/message.component";
import { RoomEvent } from "../../models/matrix/events/room/room-event";
import { MemberEventTileComponent } from "./member/member.component";
import { EventTileComponentBase } from "./event-tile.component.base";
import { Room } from "../../models/matrix/dto/room";

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

    @Input() public event: RoomEvent;
    @Input() public previousEvent: RoomEvent; // nullable
    @Input() public room: Room;

    private componentRef: ComponentRef<EventTileComponentBase>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    }

    public ngOnInit() {
        if (!this.event || !this.room) return;

        const componentType = this.tileMap[this.event.type];
        if (!componentType) {
            console.warn("Cannot render event of type " + this.event.type);
            return;
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
        this.componentRef = this.wrapper.createComponent(factory);

        this.componentRef.instance.event = this.event;
        this.componentRef.instance.room = this.room;
        this.componentRef.instance.previousEvent = this.previousEvent;
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