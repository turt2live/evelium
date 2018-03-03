import { RoomStateEvent } from "./room-state-event";

export interface RoomRelatedGroupsEvent extends RoomStateEvent {
    type: "m.room.related_groups";
    state_key: "";

    content: {
        groups: string[]; // group IDs
    };
}