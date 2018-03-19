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

import { Component, Input } from "@angular/core";
import { Room, UserReadReceipt } from "../../models/matrix/dto/room";
import * as _ from "lodash";
import { AuthService } from "../../services/matrix/auth.service";
import { User } from "../../models/matrix/dto/user";
import { MOMENT_FULL_TIMESTAMP_FORMAT } from "../../app.module";
import moment = require("moment");

@Component({
    selector: "my-event-read-receipts",
    templateUrl: "./read-receipts.component.html",
    styleUrls: ["./read-receipts.component.scss"]
})
export class ReadReceiptsComponent {

    @Input() public room: Room;
    @Input() public readReceipts: UserReadReceipt[];
    @Input() public maxIcons: number;

    constructor(private auth: AuthService) {
    }

    public get receiptsExceptOurs(): UserReadReceipt[] {
        return (this.readReceipts || []).filter(r => r.userId !== this.auth.userId);
    }

    public get orderedReadReceipts(): UserReadReceipt[] {
        return _.sortBy(this.receiptsExceptOurs, r => r.timestamp);
    }

    public get cappedReadReceipts(): UserReadReceipt[] {
        if (this.maxIcons >= 1) {
            return _.takeRight(this.orderedReadReceipts, this.maxIcons);
        }

        return this.orderedReadReceipts;
    }

    public get overflow(): number {
        if (!this.readReceipts) return 0;

        const numCapped = this.cappedReadReceipts.length;
        const numTotal = this.receiptsExceptOurs.length;

        if (numCapped !== numTotal) {
            return numTotal - numCapped;
        }

        return 0;
    }

    public getDescription(readReceipt: UserReadReceipt): string {
        const displayName = User.getDisambiguatedName(readReceipt.userId, this.room.memberEvents);
        const timestamp = moment(readReceipt.timestamp).format(MOMENT_FULL_TIMESTAMP_FORMAT);

        return `Read by ${displayName} on ${timestamp}`;
    }
}