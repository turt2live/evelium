import { RoomAccountDataEvent } from "./room-account-data-event";

export interface RoomTagEvent extends RoomAccountDataEvent {
    type: "m.tag";
    content: {
        tags?: {
            [tag: string]: {
                order: number;
            };
        };
    };
}

export class RoomTag {
    private constructor() {
    }

    public static isUserDefined(tag: string): boolean {
        return !tag.startsWith("m.");
    }

    public static getName(tag: string): string {
        if (!RoomTag.isUserDefined(tag)) return tag; // should be handled elsewhere

        if (tag.startsWith("u.")) return tag.substring(2);
        return tag;
    }
}