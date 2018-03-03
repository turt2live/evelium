import { AccountDataEvent } from "./account-data-event";

export interface DirectChatsEvent extends AccountDataEvent {
    type: "m.direct";
    content: {
        [userId: string]: string[]; // array of room IDs
    };
}