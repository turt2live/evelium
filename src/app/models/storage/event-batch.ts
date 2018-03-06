import { RoomEvent } from "../matrix/events/room/room-event";

export interface RawEventBatch {
    id: number;
    roomId: string;
    startToken: string;
    endToken: string;
    events: RoomEvent[];
}

export class PersistedEventBatch {
    constructor(public id: number, public roomId: string, public events: RoomEvent[], public startToken: string, public endToken: string) {
    }

    public toRaw(withId = true): RawEventBatch {
        const result = {
            id: this.id,
            roomId: this.roomId,
            startToken: this.startToken,
            endToken: this.endToken,
            events: this.events,
        };
        if (!withId) delete result['id'];
        return result;
    }

    public static parseAll(batches: RawEventBatch[]): PersistedEventBatch[] {
        return batches.map(b => new PersistedEventBatch(b.id, b.roomId, b.events, b.startToken, b.endToken));
    }
}