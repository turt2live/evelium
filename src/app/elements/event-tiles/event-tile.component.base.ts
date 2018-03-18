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

import { Input } from "@angular/core";
import { Room } from "../../models/matrix/dto/room";
import { RoomTimelineEvent } from "../../views/room/room.component";
import { RoomEvent } from "../../models/matrix/events/room/room-event";
import { RoomMemberEvent } from "../../models/matrix/events/room/state/m.room.member";

export abstract class EventTileComponentBase {
    @Input() timelineEvent: RoomTimelineEvent;
    @Input() room: Room;

    public get event(): RoomEvent {
        return this.timelineEvent.event;
    }

    public get previousTimelineEvent(): RoomTimelineEvent {
        return this.timelineEvent.previous ? this.timelineEvent.previous : null;
    }

    public get previousEvent(): RoomEvent {
        return this.previousTimelineEvent ? this.previousTimelineEvent.event : null;
    }

    public get sender(): RoomMemberEvent {
        return this.room.state.filter(e => e.type === "m.room.member").map(e => <RoomMemberEvent>e)
            .find(e => e.state_key === this.event.sender);
    }
}