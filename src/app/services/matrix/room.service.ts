import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthenticatedApi } from "./authenticated-api";
import { MatrixAuthService } from "./auth.service";
import { MatrixRoom } from "../../models/matrix/dto/room";
import { RoomStateEvent } from "../../models/matrix/events/room/state/room-state-event";
import { MatrixAccountService } from "./account.service";
import { DirectChatsEvent } from "../../models/matrix/events/account/m.direct";

interface UsersToRoomsDmMap {
    [userId: string]: string[]; // room IDs
}

interface RoomsToUsersDmMap {
    [roomId: string]: string[]; // user IDs
}

interface DmMap {
    users: UsersToRoomsDmMap;
    rooms: RoomsToUsersDmMap;
}

@Injectable()
export class MatrixRoomService extends AuthenticatedApi {

    private static ROOM_CACHE: { [roomId: string]: MatrixRoom } = {};

    private dmRoomMap: DmMap = {users: {}, rooms: {}};

    constructor(http: HttpClient, auth: MatrixAuthService,
                private account: MatrixAccountService) {
        super(http, auth);

        this.account.getAccountDataStream().subscribe(e => {
            if (e.type !== "m.direct") return;
            this.parseDirectChats(<DirectChatsEvent>e);
        });
    }

    public getRoom(roomId: string): MatrixRoom {
        return MatrixRoomService.ROOM_CACHE[roomId];
    }

    public getAllRooms(): MatrixRoom[] {
        return Object.keys(MatrixRoomService.ROOM_CACHE).map(id => MatrixRoomService.ROOM_CACHE[id]);
    }

    private parseDirectChats(list: DirectChatsEvent): void {
        const withUsers: UsersToRoomsDmMap = {};
        const forRooms: RoomsToUsersDmMap = {};

        const oldRooms = Object.keys(this.dmRoomMap.rooms);
        for (const userId in list.content) {
            if (!withUsers[userId]) withUsers[userId] = [];

            for (const roomId of list.content[userId]) {
                if (!forRooms[roomId]) forRooms[roomId] = [];

                withUsers[userId].push(roomId);
                forRooms[roomId].push(userId);

                const room = this.getRoom(roomId);
                if (room) room.isDirect = true; // automagically saves
            }
        }

        const notDirectIds = oldRooms.filter(rid => forRooms[rid] === undefined);
        for (const roomId of notDirectIds) {
            const room = this.getRoom(roomId);
            if (room) room.isDirect = false; // automagically saves
        }

        console.log("Setting new DM Room Map");
        this.dmRoomMap = {users: withUsers, rooms: forRooms};
    }

    public isDirect(roomId: string): boolean {
        const users = this.dmRoomMap.rooms[roomId];
        return users && users.length > 0;
    }

    public setDirect(roomId: string, withUsers: string[]): Promise<any> {
        const newMap = <UsersToRoomsDmMap>JSON.parse(JSON.stringify(this.dmRoomMap.users));

        for (const user of withUsers) {
            if (!newMap[user]) newMap[user] = [];

            const idx = newMap[user].indexOf(roomId);
            if (idx === -1) newMap[user].push(roomId);
        }

        const event: DirectChatsEvent = {
            type: "m.direct",
            content: newMap,
        };
        return this.account.setAccountData(event);
    }

    public setNotDirect(roomId: string): Promise<any> {
        const withUsers = this.dmRoomMap.rooms[roomId];
        if (!withUsers || withUsers.length === 0) return Promise.resolve(); // No changes needed

        const newMap = <UsersToRoomsDmMap>JSON.parse(JSON.stringify(this.dmRoomMap.users));
        for (const user of withUsers) {
            if (newMap[user]) {
                const idx = newMap[user].indexOf(roomId);
                if (idx !== -1) newMap[user].splice(idx, 1);
            }
        }

        const event: DirectChatsEvent = {
            type: "m.direct",
            content: newMap,
        };
        return this.account.setAccountData(event);
    }

    public cacheRoomFromState(roomId: string, state: RoomStateEvent[]): MatrixRoom {
        const isDirect = this.isDirect(roomId);
        const mtxRoom = new MatrixRoom(roomId, isDirect, state);
        MatrixRoomService.ROOM_CACHE[roomId] = mtxRoom;
        return mtxRoom;
    }
}