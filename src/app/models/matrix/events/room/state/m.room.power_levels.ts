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

import { RoomStateEvent } from "./room-state-event";
import { RoomEvent } from "../room-event";

export interface RoomPowerLevelsEvent extends RoomStateEvent {
    type: "m.room.power_levels";
    state_key: "";

    content: {
        // Note how EVERYTHING is optional!!

        ban?: number;
        invite?: number;
        kick?: number;
        redact?: number; // does not include own events

        events_default?: number;
        state_default?: number;
        events?: { [eventType: string]: number };

        users_default?: number;
        users?: { [userId: string]: number };
    };
}

export class PowerLevel {
    private constructor() {
    }

    public static forUser(userId: string, plEvent: RoomPowerLevelsEvent): number {
        if (!plEvent || !plEvent.content) return 0;

        let pl = plEvent.content.users_default || 0;
        if (plEvent.content.users && plEvent.content.users[userId]) pl = plEvent.content.users[userId];

        return pl;
    }

    public static forEvent(eventType: string, isState: boolean, plEvent: RoomPowerLevelsEvent): number {
        if (!plEvent || !plEvent.content) return 0;

        let pl = isState ? plEvent.content.state_default : plEvent.content.events_default;
        if (!pl && pl !== 0) pl = isState ? 50 : 0;
        if (plEvent.content.events && plEvent.content.events[eventType]) pl = plEvent.content.events[eventType];

        return pl;
    }

    public static canSendEvent(userId: string, eventType: string, isState: boolean, plEvent: RoomPowerLevelsEvent): boolean {
        const userPl = PowerLevel.forUser(userId, plEvent);
        const eventPl = PowerLevel.forEvent(eventType, isState, plEvent);

        return userPl >= eventPl;
    }

    private static canDo(baseAction: string, userId: string, plEvent: RoomPowerLevelsEvent): boolean {
        const userPl = PowerLevel.forUser(userId, plEvent);

        let actionPl = 50;
        if (plEvent && plEvent.content && (plEvent.content[baseAction] || plEvent.content[baseAction] === 0)) {
            actionPl = plEvent.content[baseAction];
        }

        return userPl >= actionPl;
    }

    public static canInvite(userId: string, plEvent: RoomPowerLevelsEvent): boolean {
        return PowerLevel.canDo('invite', userId, plEvent);
    }

    public static canKick(userId: string, plEvent: RoomPowerLevelsEvent): boolean {
        return PowerLevel.canDo('kick', userId, plEvent);
    }

    public static canBan(userId: string, plEvent: RoomPowerLevelsEvent): boolean {
        return PowerLevel.canDo('ban', userId, plEvent);
    }

    public static canRedact(userId: string, plEvent: RoomPowerLevelsEvent): boolean {
        return PowerLevel.canDo('redact', userId, plEvent);
    }

    public static canRedactEvent(userId: string, event: RoomEvent, plEvent: RoomPowerLevelsEvent): boolean {
        if (event.sender === userId) {
            const isState = (<RoomStateEvent>event).state_key !== undefined;
            return PowerLevel.canSendEvent(userId, "m.room.redaction", isState, plEvent);
        } else return PowerLevel.canRedact(userId, plEvent);
    }
}