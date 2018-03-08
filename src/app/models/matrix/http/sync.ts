import { AccountDataEvent } from "../events/account/account-data-event";
import { MatrixEvent } from "../events/event";
import { PresenceEvent } from "../events/ephemeral/m.presence";
import { RoomStateEvent } from "../events/room/state/room-state-event";
import { RoomEvent } from "../events/room/room-event";
import { EphemeralEvent } from "../events/ephemeral/ephemeral-event";
import { RoomAccountDataEvent } from "../events/account/room_account/room-account-data-event";

export interface RoomTimeline {
    limited: boolean;
    prev_batch: string;
    events: RoomEvent[];
}

export interface RoomAccountData {
    events: RoomAccountDataEvent[];
}

export interface RoomEphemeralTimeline {
    events: EphemeralEvent[];
}

export interface SyncJoinedRooms {
    [roomId: string]: {
        unread_notifications: {
            highlight_count: number;
            notification_count: number;
        };
        state: {
            events: RoomStateEvent[];
        };
        ephemeral: RoomEphemeralTimeline;
        account_data: RoomAccountData;
        timeline: RoomTimeline;
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
            [roomId: string]: {
                state: {
                    events: RoomStateEvent[];
                    state: {
                        events: RoomStateEvent[];
                    };
                    account_data: RoomAccountData;
                    timeline: {
                        limited: boolean;
                        prev_batch: string;
                        events: RoomEvent[];
                    }
                };
            };
        };
        join: SyncJoinedRooms;
        invite: {
            [roomId: string]: {
                invite_state: RoomStateEvent[];
            };
        };
    };
}