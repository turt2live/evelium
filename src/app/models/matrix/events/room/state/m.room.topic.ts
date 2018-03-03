import { RoomStateEvent } from "./room-state-event";

export interface RoomTopicEvent extends RoomStateEvent {
    type: "m.room.topic";
    state_key: "";

    content: {
        topic: string; // plain text
    };
}