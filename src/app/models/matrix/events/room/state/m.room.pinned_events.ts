import { RoomStateEvent } from "./room-state-event";

export interface RoomPinnedEventsEvent extends RoomStateEvent {
    type: "m.room.pinned_events";
    state_key: "";

    content: {
        pinned: string[]; // event IDs, ordered
    };
}