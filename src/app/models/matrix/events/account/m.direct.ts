import { AccountDataEvent } from "./account-data-event";

export interface DirectChatsEvent extends AccountDataEvent {
    type: "m.direct";
    content: DirectChatsEventContent;
}

export interface DirectChatsEventContent {
    [userId: string]: string[]; // array of room IDs
}