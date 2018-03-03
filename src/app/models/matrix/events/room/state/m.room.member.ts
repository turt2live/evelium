import { RoomStateEvent } from "./room-state-event";

export interface RoomMemberEvent extends RoomStateEvent {
    type: "m.room.member";
    state_key: string; // user ID for this event

    content: {
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
    };

    // Can be provided to give some context for the invite (such as the room name, etc).
    // This is called "StrippedState" in the spec
    invite_room_state?: {
        state_key: string;
        type: string;
        content: any;
    }[];
}