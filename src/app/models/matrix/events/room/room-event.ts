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

import { MatrixEvent, SimpleEvent } from "../event";

export interface RoomEvent extends MatrixEvent {
    sender: string;
    event_id: string;
    origin_server_ts: number;
    unsigned?: any; // TODO: Determine
}

export class SimpleRoomEvent<T extends string> extends SimpleEvent<T> implements RoomEvent {
    public event_id: string;
    public origin_server_ts = 0;
    public sender: string;

    constructor(type: T, content: any) {
        super(type, content);
    }
}