import { RoomEvent } from "./room-event";

export interface RoomCallInviteEvent extends RoomEvent {
    type: "m.call.invite";

    content: {
        call_id: string;
        version: 0 | number;
        lifetime: number;
        offer: {
            type: string;
            sdp: string;
        };
    };
}