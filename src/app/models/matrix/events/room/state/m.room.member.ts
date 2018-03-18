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

import { RoomStateEvent } from "./room-state-event";

export interface RoomMemberEvent extends RoomStateEvent {
    type: "m.room.member";
    state_key: string; // user ID for this event

    content: RoomMemberEventContent;

    // Can be provided to give some context for the invite (such as the room name, etc).
    // This is called "StrippedState" in the spec
    invite_room_state?: {
        state_key: string;
        type: string;
        content: any;
    }[];
}

export interface RoomMemberEventContent {
    avatar_url?: string; // mxc
    displayname?: string; // the lack of underscore is intentional - it's a spec problem
    membership: "invite" | "join" | "knock" | "leave" | "ban";
    is_direct?: boolean;

    // 3pid invite is only given after a m.room.third_party_invite event (and if this is membership: invite)
    third_party_invite?: {
        display_name: string;
        signed: {
            mxid: string;
            token: string;
            signatures: {
                [id: string]: any; // TODO: Define
            };
        };
    };
}