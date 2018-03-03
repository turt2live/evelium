import { RoomEvent } from "./room-event";

export interface RoomCallAnswerEvent extends RoomEvent {
    type: "m.call.answer";

    content: {
        call_id: string;
        version: 0 | number;
        answer: {
            type: "answer";
            sdp: string;
        };
    };
}