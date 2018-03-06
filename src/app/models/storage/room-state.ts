import { RoomStateEvent } from "../matrix/events/room/state/room-state-event";
import { MatrixRoom } from "../matrix/dto/room";

export interface RawRoomState {
    id: number;
    roomId: string;
    events: RoomStateEvent[];
}

export class PersistedRoomState {
    constructor(public id: number, public roomId: string, public events: RoomStateEvent[]) {
    }

    public toRaw(withId = true): RawRoomState {
        const result = {
            id: this.id,
            roomId: this.roomId,
            events: this.events,
        };
        if (!withId) delete result['id'];
        return result;
    }

    public static parse(state: RawRoomState): PersistedRoomState {
        return new PersistedRoomState(state.id, state.roomId, state.events);
    }

    public static fromRoom(room: MatrixRoom): PersistedRoomState {
        console.log(room.id + " has " + room.state.length + " state events");
        return new PersistedRoomState(null, room.id, room.state);
    }
}