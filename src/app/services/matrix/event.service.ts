import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthenticatedApi } from "./authenticated-api";
import { MatrixAuthService } from "./auth.service";
import { MatrixRoom } from "../../models/matrix/dto/room";
import { MatrixHomeserverService } from "./homeserver.service";
import { IncompleteRoomEvent, RoomEvent } from "../../models/matrix/events/room/room-event";
import { SendEventResponse } from "../../models/matrix/events";

@Injectable()
export class MatrixEventService extends AuthenticatedApi {

    constructor(http: HttpClient, auth: MatrixAuthService,
                private hs: MatrixHomeserverService) {
        super(http, auth);
    }

    private getTxnId(): string {
        return "evelium." + new Date().getTime();
    }

    public sendEvent(type: string, content: any, room: MatrixRoom): Promise<IncompleteRoomEvent> {
        const event = <RoomEvent>{type: type, content: content, event_id: "to be generated"};
        return this.sendRawEvent(event, room);
    }

    public sendRawEvent(event: IncompleteRoomEvent, room: MatrixRoom): Promise<IncompleteRoomEvent> {
        event.event_id = "_PENDING_$" + new Date().getTime() + "-" + room.id + "-" + event.type + ":io.evelium.fake";

        const txnId = this.getTxnId();
        const action = `/rooms/${room.id}/send/${event.type}/${txnId}`;

        // Queue the event in the room's pending timeline
        room.pendingEvents.push(event);
        return this.put<SendEventResponse>(this.hs.buildCsUrl(action), event.content).toPromise().then(r => {
            const idx = room.pendingEvents.indexOf(event);
            if (idx !== -1) room.pendingEvents.splice(idx, 1);

            event.event_id = r.event_id;
            return event;
        });
    }
}
