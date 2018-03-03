import { RoomStateEvent } from "./room-state-event";

export interface RoomCreateEvent extends RoomStateEvent {
    type: "m.room.create";
    state_key: "";

    content: {
        creator: string; // user ID
    };
}