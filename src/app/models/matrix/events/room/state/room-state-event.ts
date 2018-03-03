import { RoomEvent } from "../room-event";

export interface RoomStateEvent extends RoomEvent {
    state_key: "" | string;
}