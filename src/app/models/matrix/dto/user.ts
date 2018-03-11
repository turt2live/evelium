/*
 *     Evelium - A matrix client
 *     Copyright (C)  2018 Travis Ralston
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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