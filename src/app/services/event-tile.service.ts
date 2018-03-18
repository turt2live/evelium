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

import { Injectable, Type } from "@angular/core";
import { EventTileComponentBase } from "../elements/event-tiles/event-tile.component.base";
import { MemberEventTileComponent } from "../elements/event-tiles/state/member/member.component";
import { MessageEventTileComponent } from "../elements/event-tiles/message/message.component";
import { RoomNameEventTileComponent } from "../elements/event-tiles/state/name/name.component";
import { RoomTopicEventTileComponent } from "../elements/event-tiles/state/topic/topic.component";
import { CreateRoomEventTileComponent } from "../elements/event-tiles/state/create/create.component";
import { RoomEvent } from "../models/matrix/events/room/room-event";

interface TileMap {
    [eventType: string]: Type<EventTileComponentBase>;
}

let cachedTileMap: TileMap;

/**
 * Service for handling rendering of event tiles. Event tiles are components which represent
 * a specific event type.
 */
@Injectable()
export class EventTileService {

    constructor() {
    }

    /**
     * Gets the complete tile map for all renderable event types.
     * @returns {TileMap} The tile map.
     */
    public get tileMap(): TileMap {
        // This is done as a instance getter with an external cache property to ensure that
        // the component classes are fully set up by the time we need them. If this map
        // was created as a regular static property then we'd have the issue of components
        // being seen as undefined.
        if (!cachedTileMap) {
            cachedTileMap = {
                'm.room.message': MessageEventTileComponent,
                'm.room.member': MemberEventTileComponent,
                'm.room.create': CreateRoomEventTileComponent,
                'm.room.name': RoomNameEventTileComponent,
                'm.room.topic': RoomTopicEventTileComponent,
            };
        }

        return cachedTileMap;
    }

    /**
     * Determines if a given event is renderable or not
     * @param {RoomEvent} event The event to check
     * @returns {boolean} True if the event is renderable, false otherwise
     */
    public isRenderable(event: RoomEvent): boolean {
        return !!this.tileMap[event.type];
    }
}