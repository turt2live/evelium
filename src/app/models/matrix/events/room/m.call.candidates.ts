import { RoomEvent } from "./room-event";

export interface RoomCallCandidatesEvent extends RoomEvent {
    type: "m.call.candidates";

    content: {
        call_id: string;
        version: 0 | number;
        candidates: {
            sdpMid: string;
            sdpMLineIndex: number;
            candidate: string;
        }[];
    };
}