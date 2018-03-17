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

import { Injectable } from "@angular/core";
import { Command } from "./handlers/command";
import { Room } from "../../models/matrix/dto/room";
import { EmoteCommand } from "./handlers/emote-command";

const COMMAND_PREFIX = "/";

/**
 * Command processing service for the client.
 */
@Injectable()
export class CommandService {

    private commands: Command[] = <Command[]>[
        new EmoteCommand(),
    ];

    constructor() {
    }

    /**
     * Determines if a given message looks like a known/valid command
     * @param {string} fullMessage The complete message to check the format of
     * @returns {boolean} True if the message looks like a command, false otherwise
     */
    public isCommand(fullMessage: string): boolean {
        if (!fullMessage.startsWith(COMMAND_PREFIX)) return false;

        // TODO: Should we return `true` regardless of the command being registered?
        fullMessage = fullMessage.substring(COMMAND_PREFIX.length);
        return !!this.getMatchedCommand(fullMessage);
    }

    /**
     * Processes a given command, executing it. The returned promise will resolve if
     * the execution completes successfully. If there is an error with the execution,
     * the promise will be rejected. If the rejected reason is a string, the client
     * should show that to the user.
     * @param {string} fullMessage The complete message to process
     * @param {Room} room The room the command should be processed in.
     * @returns {Promise<any>} Resolves when the command execution has completed.
     */
    public process(fullMessage: string, room: Room): Promise<any> {
        if (!this.isCommand(fullMessage)) return Promise.reject("Unknown command");

        fullMessage = fullMessage.substring(COMMAND_PREFIX.length);
        const result = this.getMatchedCommand(fullMessage);

        return result.command.process(fullMessage, room, result.prefix);
    }

    private getMatchedCommand(message: string): { command: Command, prefix: string } {
        for (const command of this.commands) {
            for (const prefix of command.prefixes()) {
                if (message.startsWith(prefix)) return {command, prefix};
            }
        }

        return null;
    }
}