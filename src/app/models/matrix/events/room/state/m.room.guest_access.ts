import { RoomStateEvent } from "./room-state-event";

export interface RoomGuestAccessEvent extends RoomStateEvent {
    type: "m.room.guest_access";
    state_key: "";

    content: {
        guest_access: "can_join" | "forbidden";
    };
}