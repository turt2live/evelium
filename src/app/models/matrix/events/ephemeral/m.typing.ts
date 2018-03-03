import { EphemeralEvent } from "./ephemeral-event";

export interface TypingEvent extends EphemeralEvent {
    type: "m.typing";
    room_id: string;
    content: {
        user_ids: string[];
    };
}