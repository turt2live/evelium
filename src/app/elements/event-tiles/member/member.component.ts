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
import { RoomMemberEvent, RoomMemberEventContent } from "../../../models/matrix/events/room/state/m.room.member";
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

    public get target(): RoomMemberEvent {
        // This is a safe cast
        return <RoomMemberEvent>this.event;
    }

    public get timestamp(): string {
        return moment(this.event.origin_server_ts).fromNow();
    }

    public get fullTimestamp(): string {
        return moment(this.event.origin_server_ts).format(); // TODO: Actually format the timestamp
    }

    public get previousTargetContent(): RoomMemberEventContent {
        return <RoomMemberEventContent>((this.target.unsigned ? this.target.unsigned.prev_content : null) || {});
    }

    public get determinedState(): string {
        const content = <RoomMemberEventContent>((this.target.content) || {});
        const previousContent = this.previousTargetContent;

        if (content.membership === "join" && previousContent.membership === "join") {
            // Display name and/or avatar change
            const displayNameChanged = content.displayname !== previousContent.displayname;
            const avatarChanged = content.avatar_url !== previousContent.avatar_url;

            if (displayNameChanged && avatarChanged) return "displayname_avatar";
            if (avatarChanged) return "avatar";
            if (displayNameChanged) return "displayname";
            return "none";
        }

        if (content.membership === "join") {
            return "join";
        }

        if (content.membership === "leave") {
            if (previousContent.membership === "ban") {
                return "unban";
            }

            if (previousContent.membership === "invite") {
                return "decline";
            }

            if (this.sender.state_key !== this.target.state_key) {
                return "kick";
            }

            return "left";
        }

        if (content.membership === "ban") {
            return "ban";
        }

        if (content.membership === "invite") {
            return "invite";
        }

        return "none";
    }
}