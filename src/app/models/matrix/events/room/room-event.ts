import { MatrixEvent } from "../event";

export interface RoomEvent extends MatrixEvent {
    sender: string;
    event_id: string;
    origin_server_ts: number;
    unsigned: any; // TODO: Determine
}