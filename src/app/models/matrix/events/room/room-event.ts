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