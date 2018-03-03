import { EphemeralEvent } from "./ephemeral-event";

export interface PresenceEvent extends EphemeralEvent {
    type: "m.presence";
    sender: string; // user ID
    content: {
        // Note: In practice these are never seen
        avatar_url?: string; // mxc
        displayname?: string; // lack of casing is a spec thing

        currently_active?: boolean;
        last_active_ago: number; // ms
        presence: "online" | "unavailable" | "offline";
    };
}