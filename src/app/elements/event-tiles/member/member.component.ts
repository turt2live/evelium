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

import { Component } from "@angular/core";
import { RoomMemberEvent } from "../../../models/matrix/events/room/state/m.room.member";
import { User } from "../../../models/matrix/dto/user";
import { EventTileComponentBase } from "../event-tile.component.base";
import moment = require("moment");

@Component({
    selector: "my-member-event-tile",
    templateUrl: "./member.component.html",
    styleUrls: ["./member.component.scss"]
})
export class MemberEventTileComponent extends EventTileComponentBase {

    constructor() {
        super();
    }

    private getRoomMembers(): RoomMemberEvent[] {
        return this.room.state.filter(e => e.type === "m.room.member").map(e => <RoomMemberEvent>e);
    }

    public get memberEvent(): RoomMemberEvent {
        // We can safely cast this
        return <RoomMemberEvent>this.event;
    }

    public get senderDisplayName(): string {
        return User.getDisambiguatedName(this.event.sender, this.getRoomMembers());
    }

    public get targetDisplayName(): string {
        return User.getDisambiguatedName(this.memberEvent.state_key, this.getRoomMembers());
    }

    public get timestamp(): string {
        return moment(this.event.origin_server_ts).fromNow();
    }

    public get fullTimestamp(): string {
        return moment(this.event.origin_server_ts).format(); // TODO: Actually format the timestamp
    }

    public get isLeaving(): boolean {
        return this.memberEvent.content.membership === "leave" || this.memberEvent.content.membership === "ban";
    }

    public get description(): string {
        let prevContent: any = {};
        if (this.memberEvent.unsigned && this.memberEvent.unsigned.prev_content)
            prevContent = this.memberEvent.unsigned.prev_content;

        let oldAvatar = prevContent.avatar_url;
        let oldDisplayName = prevContent.displayname;
        let oldMembership = prevContent.membership;

        let newAvatar = this.memberEvent.content.avatar_url;
        let newDisplayName = this.memberEvent.content.displayname;
        let newMembership = this.memberEvent.content.membership;

        if (newMembership !== oldMembership) {
            switch (newMembership) {
                case "join":
                    return `${this.targetDisplayName} joined the room`;
                case "ban":
                    return `${this.targetDisplayName} was banned from the room by ${this.senderDisplayName}`;
                case "invite":
                    return `${this.targetDisplayName} was invited to the room by ${this.senderDisplayName}`;
                case "leave": {
                    if (oldMembership === "invite")
                        return `${this.targetDisplayName} rejected the invite`;
                    if (this.memberEvent.state_key !== this.memberEvent.sender)
                        return `${this.targetDisplayName} was kicked from the room by ${this.senderDisplayName}`;
                    return `${this.targetDisplayName} left the room`;
                }
                case "knock":
                    return `${this.targetDisplayName} knocked on the room`; // Not technically implemented
                default:
                    return `${this.targetDisplayName} broke the protocol (E_INVALID_MEMBERSHIP)`; // Should never happen
            }
        }

        let message = "";
        if (newDisplayName !== oldDisplayName) {
            message = `${oldDisplayName} changed their display name to ${this.targetDisplayName}`;
        }
        if (newAvatar !== oldAvatar) {
            if (message.length > 0) message += " and changed their avatar";
            else message = `${this.targetDisplayName} changed their avatar`
        }

        return message || `${this.targetDisplayName} did nothing (E_NO_CHANGE)`;
    }
}