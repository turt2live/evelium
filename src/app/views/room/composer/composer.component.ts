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

import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Room } from "../../../models/matrix/dto/room";
import * as KeyCode from "keycode-js";
import { ElasticDirective } from "../../../directives/elastic.directive";
import { CommandService } from "../../../services/commands/command.service";
import { ToasterService } from "angular2-toaster";

@Component({
    selector: "my-room-message-composer",
    templateUrl: "./composer.component.html",
    styleUrls: ["./composer.component.scss"]
})
export class RoomMessageComposerComponent {

    @ViewChild(ElasticDirective) public messageInput: ElasticDirective;

    @Input() public room: Room;
    @Output() public onResize: EventEmitter<any> = new EventEmitter<any>();

    public message: string;

    constructor(private toaster: ToasterService, private commands: CommandService) {
    }

    public onKeyDown(evt: KeyboardEvent) {
        if (evt.keyCode === KeyCode.KEY_RETURN && !evt.shiftKey) {
            evt.preventDefault();
            this.sendMessage();
        }
    }

    public sendMessage() {
        if (!this.message || !this.message.trim()) return; // don't send whitespace

        let processPromise = Promise.resolve();
        if (this.commands.isCommand(this.message)) {
            processPromise = this.commands.process(this.message, this.room);
        } else {
            processPromise = Promise.resolve(this.room.sendMessage(this.message));
        }

        processPromise.then(() => {
            this.message = "";

            // HACK: Automatically adjust the field after we reset the content
            // This is because it doesn't automatically decrease in size.
            if (this.messageInput) this.messageInput.adjust();
        }).catch(err => {
            let message = "Unexpected error sending message";
            if (typeof err === "string") {
                message = err;
            } else {
                console.error(err);
            }

            this.toaster.pop("error", message);
        });
    }
}