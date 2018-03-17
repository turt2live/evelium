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

import { Subject } from "rxjs/Subject";
import { RoomEvent } from "../events/room/room-event";
import { RoomStateEvent } from "../events/room/state/room-state-event";
import { RoomTopicEvent } from "../events/room/state/m.room.topic";
import { RoomAvatarEvent } from "../events/room/state/m.room.avatar";
import { RoomMemberEvent } from "../events/room/state/m.room.member";
import { RoomCanonicalAliasEvent } from "../events/room/state/m.room.canonical_alias";
import { RoomNameEvent } from "../events/room/state/m.room.name";
import { User } from "./user";
import { Observable } from "rxjs/Observable";
import { AuthService } from "../../../services/matrix/auth.service";
import { SimpleRoomMessageEvent } from "../events/room/m.room.message";
import * as Showdown from "showdown";
import { LocatorService } from "../../../services/locator.service";

export class Room {
    public timeline: Subject<RoomEvent>;
    public pendingTimeline: Observable<RoomEvent[]>;

    public isDirect: boolean;

    constructor(public readonly roomId: string, public state: RoomStateEvent[]) {
    }

    public get topic(): string {
        const event = <RoomTopicEvent>this.state.find(e => e.type === "m.room.topic");
        return event && event.content ? event.content.topic : undefined;
    }

    public get avatarMxc(): string {
        const event = <RoomAvatarEvent>this.state.find(e => e.type === "m.room.avatar");
        if (!event || !event.content || !event.content.url) {
            const joinedMembers = this.state.filter(e => e.type === "m.room.member")
                .map(e => <RoomMemberEvent>e)
                .filter(e => e.state_key !== AuthService.USER_ID)
                .filter(e => e.content && (e.content.membership === "invite" || e.content.membership === "join"));
            if (joinedMembers.length === 1) return joinedMembers[0].content.avatar_url;
        }
        return event && event.content ? event.content.url : undefined;
    }

    public get displayName(): string {
        const selfUserId = AuthService.USER_ID;

        const nameEvent = <RoomNameEvent>this.state.find(e => e.type === "m.room.name");
        if (nameEvent && nameEvent.content && nameEvent.content.name) return nameEvent.content.name;

        const canonicalAliasEvent = <RoomCanonicalAliasEvent>this.state.find(e => e.type === "m.room.canonical_alias");
        if (canonicalAliasEvent && canonicalAliasEvent.content && canonicalAliasEvent.content.alias)
            return canonicalAliasEvent.content.alias;

        const allMembers = this.state.filter(e => e.type === "m.room.member").map(e => <RoomMemberEvent>e);
        const joinedMembers = allMembers
            .filter(e => e.content && (e.content.membership === "join" || e.content.membership === "invite"))
            .filter(e => e.state_key !== selfUserId);

        if (joinedMembers.length === 0) {
            const leftMembers = allMembers.filter(e => e.state_key !== selfUserId)
                .sort((a, b) => a.state_key.localeCompare(b.state_key));

            if (leftMembers.length === 0) {
                return "Empty Room";
            }
            if (leftMembers.length === 1) {
                return "Empty Room (was " + User.getDisambiguatedName(leftMembers[0].state_key, allMembers) + ")";
            }

            return `Empty Room (was ${User.getDisambiguatedName(leftMembers[0].state_key, allMembers)} and ${leftMembers.length - 1} other${leftMembers.length - 1 !== 1 ? 's' : ''}`;
        }

        if (joinedMembers.length === 1) {
            return User.getDisambiguatedName(joinedMembers[0].state_key, allMembers);
        }

        let sortedJoinedMembers = joinedMembers.sort((a, b) => a.state_key.localeCompare(b.state_key));
        if (sortedJoinedMembers.length === 2) {
            return `${User.getDisambiguatedName(sortedJoinedMembers[0].state_key, allMembers)} and ${User.getDisambiguatedName(sortedJoinedMembers[1].state_key, allMembers)}`;
        }

        if (sortedJoinedMembers.length > 2) {
            return `${User.getDisambiguatedName(sortedJoinedMembers[0].state_key, allMembers)} and ${joinedMembers.length - 1} other${joinedMembers.length - 1 !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Helper function for sending a message into the room.
     * @param {string} body The body of the message (eg: "Hello Everyone!")
     * @param {string} type The type of message, such as m.text, m.emote, or m.notice
     * @param {boolean} parseMarkdown True to attempt to process the message as Markdown.
     */
    public sendMessage(body: string, type = "m.text", parseMarkdown = true) {
        const event = new SimpleRoomMessageEvent(body);
        event.content.msgtype = type;

        if (parseMarkdown) {
            // TODO: Don't send HTML if it's not productive
            const showdown: Showdown.Converter = LocatorService.injector.get(Showdown.Converter);
            const html = showdown.makeHtml(body);
            event.content.format = "org.matrix.custom.html";
            event.content.formatted_body = html;
        }

        this.timeline.next(event);
    }
}