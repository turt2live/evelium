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

import { Command } from "./command";
import { Room } from "../../../models/matrix/dto/room";

export class EmoteCommand implements Command {

    constructor() {
    }

    public prefixes(): string[] {
        return ['me'];
    }

    public process(message: string, room: Room, matchedPrefix: string): Promise<any> {
        const body = message.substring(matchedPrefix.length);
        if (!body || !body.trim() || !body.startsWith(" ")) return Promise.reject("Syntax: /me <emote>");

        // HACK: We don't process markdown here to avoid weird bugs that haven't been fixed yet
        return Promise.resolve(room.sendMessage(body.trim(), "m.emote", false));
    }
}