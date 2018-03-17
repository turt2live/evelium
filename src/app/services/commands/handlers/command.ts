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

import { Room } from "../../../models/matrix/dto/room";

/**
 * Represents a command for the client. Commands can be used to intercept a user's message
 * to perform an action, such as join a room or send an emote.
 */
export interface Command {
    /**
     * Gets the prefixes for this command. For example, the "/test" command
     * should return "test" here.
     * @returns {string[]} The array of prefixes, without the leading slash.
     */
    prefixes(): string[];

    /**
     * Processes the command, invoking the action. The returned promise should
     * be resolved when the command execution is successful, and rejected if
     * something went wrong. Rejections that are strings will be shown to the user
     * as-is.
     * @param {string} message The message to process (without the leading slash)
     * @param {Room} room The room the command should be processed in
     * @param {string} matchedPrefix The prefix that was matched for processing
     * @returns {Promise<any>} Resolves when the command execution is complete.
     */
    process(message: string, room: Room, matchedPrefix: string): Promise<any>;
}