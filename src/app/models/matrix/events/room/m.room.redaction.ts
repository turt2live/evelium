import { RoomEvent } from "./room-event";

export interface RoomRedactionEvent extends RoomEvent {
    type: "m.room.redaction";

    content: {
        reason?: string;
    };
}