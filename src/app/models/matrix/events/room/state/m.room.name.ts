import { RoomStateEvent } from "./room-state-event";

export interface RoomNameEvent extends RoomStateEvent {
    type: "m.room.name";
    state_key: "";

    content: {
        name: string;
    };
}