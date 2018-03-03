import { EphemeralEvent } from "./ephemeral-event";

export interface ReceiptEvent extends EphemeralEvent {
    type: "m.receipt";
    room_id: string;
    content: {
        [eventId: string]: {
            [eventType: string]: any; // Because we can technically have other events

            "m.read"?: {
                [userId: string]: {
                    ts: number;
                };
            };
        };
    };
}