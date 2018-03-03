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