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

export interface RoomThirdPartyInviteEvent extends RoomStateEvent {
    type: "m.room.third_party_invite";
    state_key: string; // The token, of which a signature must be produced in order to join the room.

    content: {
        display_name: string;
        key_validity_url: string;
        public_key: string;
        public_keys?: {
            key_validity_url?: string;
            public_key: string;
        }[];
    };
}