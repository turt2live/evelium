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