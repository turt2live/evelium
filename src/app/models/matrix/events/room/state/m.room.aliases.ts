import { RoomStateEvent } from "./room-state-event";

export interface RoomAliasesEvent extends RoomStateEvent {
    type: "m.room.aliases";
    state_key: string; // homeserver which 'owns' the aliases in this event

    content: {
        aliases: string[];
    };
}