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
    Component, ComponentFactoryResolver, ComponentRef, OnDestroy, OnInit, Type, ViewChild,
    ViewContainerRef
} from "@angular/core";
import { RoomMemberEvent } from "../../../models/matrix/events/room/state/m.room.member";
import { User } from "../../../models/matrix/dto/user";
import { EventTileComponentBase } from "../event-tile.component.base";
import { TextBody_MessageEventTileComponent } from "./text/text.component";
import { NoticeBody_MessageEventTileComponent } from "./notice/notice.component";
import { EmoteBody_MessageEventTileComponent } from "./emote/emote.component";
import { ImageBody_MessageEventTileComponent } from "./image/image.component";

const MAX_MESSAGE_TIME_BREAK = 2 * 60 * 1000; // 2 minutes

interface BodyMap {
    [msgType: string]: Type<EventTileComponentBase>;
}

let cachedBodyMap: BodyMap;

@Component({
    selector: "my-message-event-tile",
    templateUrl: "./message.component.html",
    styleUrls: ["./message.component.scss"]
})
export class MessageEventTileComponent extends EventTileComponentBase implements OnInit, OnDestroy {

    @ViewChild('eventBody', {read: ViewContainerRef}) public eventBody: ViewContainerRef;

    private componentRef: ComponentRef<EventTileComponentBase>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
        super();
    }

    public ngOnInit() {
        if (!this.timelineEvent || !this.room) return;

        const msgType = this.event.content ? this.event.content.msgtype : null;
        let componentType = this.bodyMap[msgType];
        if (!componentType) {
            console.warn("Cannot render event content of type " + msgType + " - assuming m.text");
            componentType = this.bodyMap["m.text"]; // This is based on the assumption that we actually have this option
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
        this.componentRef = this.eventBody.createComponent(factory);

        this.componentRef.instance.timelineEvent = this.timelineEvent;
        this.componentRef.instance.room = this.room;
    }

    public ngOnDestroy() {
        if (this.componentRef) {
            this.componentRef.destroy();
            this.componentRef = null; // just to clean up
        }
    }

    private getRoomMembers(): RoomMemberEvent[] {
        return this.room.state.filter(e => e.type === "m.room.member").map(e => <RoomMemberEvent>e);
    }

    public get showSender(): boolean {
        if (this.previousEvent) {
            return this.event.origin_server_ts - this.previousEvent.origin_server_ts > MAX_MESSAGE_TIME_BREAK
                || this.previousEvent.sender !== this.event.sender
                || this.previousEvent.type !== "m.room.message";
        } else return true;
    }

    public get senderDisplayName(): string {
        return User.getDisambiguatedName(this.event.sender, this.getRoomMembers());
    }

    private get bodyMap(): BodyMap {
        // This is a copy/paste of the tileMap from Event Tiles - see Event Tiles for more information.
        if (!cachedBodyMap) {
            cachedBodyMap = {
                'm.text': TextBody_MessageEventTileComponent,
                'm.notice': NoticeBody_MessageEventTileComponent,
                'm.emote': EmoteBody_MessageEventTileComponent,
                'm.image': ImageBody_MessageEventTileComponent,
            };
        }

        return cachedBodyMap;
    }
}