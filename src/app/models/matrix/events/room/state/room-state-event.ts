import { RoomEvent } from "../room-event";

export interface RoomStateEvent extends RoomEvent {
    state_key: "" | string;

    unsigned?: {
        age?: number;
        prev_content?: any;
        prev_sender?: string;
        replaces_state?: string;
    };
}