import { RoomStateEvent } from "./room-state-event";

export interface RoomHistoryVisibilityEvent extends RoomStateEvent {
    type: "m.room.history_visibility";
    state_key: "";

    content: {
        // invited == Members can see history from when they were invited
        // joined == Members can see history from when they joined
        // shared == Members can see history since selecting this option
        // world_readable == Anyone can see history since selecting this option (including non-members)
        history_visibility: "invited" | "joined" | "shared" | "world_readable";
    };
}