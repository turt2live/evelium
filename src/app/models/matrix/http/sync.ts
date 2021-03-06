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

import { AccountDataEvent } from "../events/account/account-data-event";
import { MatrixEvent } from "../events/event";
import { PresenceEvent } from "../events/ephemeral/m.presence";
import { RoomStateEvent } from "../events/room/state/room-state-event";
import { RoomEvent } from "../events/room/room-event";
import { EphemeralEvent } from "../events/ephemeral/ephemeral-event";
import { RoomAccountDataEvent } from "../events/account/room_account/room-account-data-event";


export interface SyncJoinedRoom extends SyncLeftRoom {
    unread_notifications: {
        highlight_count: number;
        notification_count: number;
    };
    ephemeral: {
        events: EphemeralEvent[];
    };
}

export interface SyncLeftRoom {
    state: {
        events: RoomStateEvent[];
    };
    account_data: {
        events: RoomAccountDataEvent[];
    };
    timeline: {
        limited: boolean;
        prev_batch: string;
        events: RoomEvent[];
    };
}

export interface SyncResponse {
    next_batch: string;
    device_one_time_keys_count: any; // TODO: Determine
    account_data: {
        events: AccountDataEvent[];
    };
    to_device: {
        events: MatrixEvent[]; // TODO: Verify
    };
    groups: {
        leave: any; // TODO: Determine
        join: {
            [groupId: string]: {}; // TODO: Verify that the body is irrelevant
        };
        invite: any; // TODO: Determine
    };
    presence: {
        events: PresenceEvent[];
    };
    device_lists: {
        changed: any; // TODO: Determine
        left: any; // TODO: Determine
    };
    rooms: {
        leave: {
            [roomId: string]: SyncLeftRoom;
        };
        join: {
            [roomId: string]: SyncJoinedRoom;
        };
        invite: {
            [roomId: string]: {
                invite_state: RoomStateEvent[];
            };
        };
    };
}