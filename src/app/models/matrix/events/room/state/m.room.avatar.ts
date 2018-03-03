import { RoomStateEvent } from "./room-state-event";
import { ImageInfo } from "../m.room.message";

export interface RoomAvatarEvent extends RoomStateEvent {
    type: "m.room.avatar";
    state_key: "";

    content: {
        url: string; // mxc
        info?: ImageInfo;
    };
}