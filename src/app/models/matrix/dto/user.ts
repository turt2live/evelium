import { RoomMemberEvent } from "../events/room/state/m.room.member";

export class User {
    private constructor() {
    }

    public static getDisambiguatedName(userId: string, roomMembers: RoomMemberEvent[]): string {
        const us = roomMembers.find(e => e.state_key === userId);
        if (!us) throw new Error("Cannot find membership event for " + userId);
        if (!us.content || !us.content.displayname) return userId;

        const nameCount = roomMembers.filter(e => {
            if (!e.content) return false;
            return e.content.displayname === us.content.displayname;
        }).length;

        return nameCount > 1 ? us.content.displayname + " (" + userId + ")" : us.content.displayname;
    }
}