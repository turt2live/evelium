import { RoomStateEvent } from "./room-state-event";

export interface RoomCanonicalAliasEvent extends RoomStateEvent {
    type: "m.room.canonical_alias";
    state_key: "";

    content: {
        alias: string;
    };
}