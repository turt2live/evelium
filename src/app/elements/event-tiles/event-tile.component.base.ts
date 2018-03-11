import { RoomEvent } from "../../models/matrix/events/room/room-event";
import { Input } from "@angular/core";
import { Room } from "../../models/matrix/dto/room";

export abstract class EventTileComponentBase {
    @Input() event: RoomEvent;
    @Input() previousEvent: RoomEvent;
    @Input() room: Room;
}