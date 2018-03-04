import { RoomStateEvent } from "../events/room/state/room-state-event";
import { RoomNameEvent } from "../events/room/state/m.room.name";
import { RoomMemberEvent } from "../events/room/state/m.room.member";
import { RoomCanonicalAliasEvent } from "../events/room/state/m.room.canonical_alias";
import { User } from "./user";

export interface MatrixRoom {
    id: string;
    displayName: string;
    avatarMxc: string;
    isDirect: boolean;
    state: RoomStateEvent[];
}

export class Room {
    private constructor() {
    }

    public static getName(state: RoomStateEvent[], selfUserId: string): string {
        const nameEvent = <RoomNameEvent>state.find(e => e.type === "m.room.name");
        if (nameEvent && nameEvent.content && nameEvent.content.name) return nameEvent.content.name;

        const canonicalAliasEvent = <RoomCanonicalAliasEvent>state.find(e => e.type === "m.room.canonical_alias");
        if (canonicalAliasEvent && canonicalAliasEvent.content && canonicalAliasEvent.content.alias)
            return canonicalAliasEvent.content.alias;

        const allMembers = state.filter(e => e.type === "m.room.member").map(e => <RoomMemberEvent>e);
        const joinedMembers = allMembers
            .filter(e => e.content && (e.content.membership === "join" || e.content.membership === "invite"))
            .filter(e => e.state_key !== selfUserId);

        if (joinedMembers.length === 0) {
            const leftMembers = allMembers.filter(e => e.state_key !== selfUserId)
                .sort((a, b) => a.state_key.localeCompare(b.state_key));

            if (leftMembers.length === 0) {
                return "Empty Room";
            }
            if (leftMembers.length === 1) {
                return "Empty Room (was " + User.getDisambiguatedName(leftMembers[0].state_key, allMembers) + ")";
            }

            return `Empty Room (was ${User.getDisambiguatedName(leftMembers[0].state_key, allMembers)} and ${leftMembers.length - 1} other${leftMembers.length - 1 !== 1 ? 's' : ''}`;
        }

        if (joinedMembers.length === 1) {
            return User.getDisambiguatedName(joinedMembers[0].state_key, allMembers);
        }

        let sortedJoinedMembers = joinedMembers.sort((a, b) => a.state_key.localeCompare(b.state_key));
        if (sortedJoinedMembers.length === 2) {
            return `${User.getDisambiguatedName(sortedJoinedMembers[0].state_key, allMembers)} and ${User.getDisambiguatedName(sortedJoinedMembers[1].state_key, allMembers)}`;
        }

        if (sortedJoinedMembers.length > 2) {
            return `${User.getDisambiguatedName(sortedJoinedMembers[0].state_key, allMembers)} and ${joinedMembers.length - 1} other${joinedMembers.length - 1 !== 1 ? 's' : ''}`;
        }
    }
}