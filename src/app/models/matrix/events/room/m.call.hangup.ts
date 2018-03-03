import { RoomEvent } from "./room-event";

export interface RoomCallHangupEvent extends RoomEvent {
    type: "m.call.hangup";

    content: {
        call_id: string;
        version: 0 | number;
    };
}