import { RoomMemberEvent } from "../events/room/state/m.room.member";

export class User {
    private constructor() {
    }

    public static getDisambiguatedName(userId: string, roomMembers: RoomMemberEvent[], usePrevious = false): string {
        const us = roomMembers.find(e => e.state_key === userId);
        if (!us) throw new Error("Cannot find membership event for " + userId);

        let ourDisplayName = null;
        if (usePrevious) {
            ourDisplayName = us.unsigned && us.unsigned.prev_content ? us.unsigned.prev_content.displayname : null;
        } else {
            ourDisplayName = us.content ? us.content.displayname : null;
        }
        if (!ourDisplayName) return userId;

        const nameCount = roomMembers.filter(e => {
            if (!e.content) return false;
            return e.content.displayname === ourDisplayName;
        }).length;

        return nameCount > 1 ? ourDisplayName + " (" + userId + ")" : ourDisplayName;
    }
}