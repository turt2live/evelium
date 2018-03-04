import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatrixHomeserverService } from "./homeserver.service";
import { AuthenticatedApi } from "./authenticated-api";
import { MatrixAuthService } from "./auth.service";
import { MatrixRoom, Room } from "../../models/matrix/dto/room";
import { RoomStateEvent } from "../../models/matrix/events/room/state/room-state-event";
import { RoomAvatarEvent } from "../../models/matrix/events/room/state/m.room.avatar";

@Injectable()
export class MatrixRoomService extends AuthenticatedApi {

    private static ROOM_CACHE: { [roomId: string]: MatrixRoom } = {};

    constructor(http: HttpClient, auth: MatrixAuthService, private hs: MatrixHomeserverService, private localStorage: Storage) {
        super(http, auth);
        console.log(this.localStorage.getItem("mx.syncToken"));
        console.log(this.hs.csApiUrl);
    }

    public getRoom(roomId: string): MatrixRoom {
        return MatrixRoomService.ROOM_CACHE[roomId];
    }

    public cacheRoomFromState(roomId: string, state: RoomStateEvent[]): MatrixRoom {
        const name = Room.getName(state, this.auth.userId);
        const isDirect = false; // TODO: Get this from account data/invite event

        const avatarEvent = <RoomAvatarEvent>state.find(e => e.type === "m.room.avatar");
        const avatarMxc = avatarEvent && avatarEvent.content && avatarEvent.content.url ? avatarEvent.content.url : null;

        const mtxRoom: MatrixRoom = {
            id: roomId,
            displayName: name,
            avatarMxc: avatarMxc,
            isDirect: isDirect,
            state: state,
        };

        MatrixRoomService.ROOM_CACHE[roomId] = mtxRoom;

        return mtxRoom;
    }
}