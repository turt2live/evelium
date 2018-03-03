import { RoomStateEvent } from "./room-state-event";

export interface RoomJoinRulesEvent extends RoomStateEvent {
    type: "m.room.join_rules";
    state_key: "";

    content: {
        join_rule: "public" | "knock" | "invite" | "private";
    };
}