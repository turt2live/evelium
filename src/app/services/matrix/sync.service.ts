import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatrixHomeserverService } from "./homeserver.service";
import { AuthenticatedApi } from "./authenticated-api";
import { MatrixAuthService } from "./auth.service";
import { RoomTimeline, SyncJoinedRooms, SyncResponse } from "../../models/matrix/http/sync";
import { Observable } from "rxjs/Observable";
import { MatrixRoom } from "../../models/matrix/dto/room";
import { MatrixRoomService } from "./room.service";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { MatrixAccountService } from "./account.service";
import { AccountDataEvent } from "../../models/matrix/events/account/account-data-event";
import { RoomStateEvent } from "../../models/matrix/events/room/state/room-state-event";

@Injectable()
export class MatrixSyncService extends AuthenticatedApi {

    private static IS_SYNCING = false;
    private static EVENT_STREAMS = {
        "self.room.join": new ReplaySubject<MatrixRoom>()
    };

    constructor(http: HttpClient, auth: MatrixAuthService,
                private hs: MatrixHomeserverService,
                private rooms: MatrixRoomService,
                private account: MatrixAccountService) {
        super(http, auth);
    }

    public getStream<T>(event: string): Observable<T> {
        if (!MatrixSyncService.EVENT_STREAMS[event]) {
            MatrixSyncService.EVENT_STREAMS[event] = new ReplaySubject<T>();
        }
        return MatrixSyncService.EVENT_STREAMS[event];
    }

    private getBroadcastStream<T>(event: string): ReplaySubject<T> {
        return <ReplaySubject<T>>this.getStream<T>(event);
    }

    public startSyncing(): void {
        if (MatrixSyncService.IS_SYNCING) return;

        MatrixSyncService.IS_SYNCING = true;
        let nextToken: string = undefined;
        const handler = (r: SyncResponse) => {
            return this.parseSync(r).then(() => {
                nextToken = r.next_batch;
                return this.doSync(nextToken).then(handler).catch(errorHandler);
            });
        };
        const errorHandler = (e: Error) => {
            // TODO: Back off
            console.error(e);
            return this.doSync(nextToken).then(handler).catch(errorHandler);
        };

        this.doSync(nextToken).then(handler).catch(errorHandler);
    }

    private doSync(token: string = null): Promise<any> {
        const request = {
            timeout: 30000,
        };
        if (token) request["since"] = token;
        return this.get<SyncResponse>(this.hs.buildCsUrl("sync"), request).toPromise();
    }

    private parseSync(sync: SyncResponse): Promise<any> {
        if (!sync) return Promise.resolve();

        const promises: Promise<any>[] = [];

        if (sync.account_data && sync.account_data.events) {
            promises.push(this.parseSyncAccountData(sync.account_data.events));
        }
        if (sync.rooms && sync.rooms.join) {
            promises.push(this.parseSyncJoinedRooms(sync.rooms.join));
        }

        return Promise.all(promises);
    }

    private parseSyncAccountData(events: AccountDataEvent[]): Promise<any> {
        return Promise.all(events.map(event => this.account.setAccountData(event, true)));
    }

    private parseSyncJoinedRooms(joined: SyncJoinedRooms): Promise<any> {
        for (const roomId in joined) {
            const room = joined[roomId];

            let existingRoom = this.rooms.getRoom(roomId);
            if (!existingRoom) {
                if (!room.state || !room.state.events) {
                    console.warn("Room " + roomId + " has no state - skipping room join");
                    continue;
                }
                existingRoom = this.rooms.cacheRoomFromState(roomId, room.state.events);
                this.getBroadcastStream("self.room.join").next(existingRoom);
            }

            this.processTimeline(existingRoom, room.timeline);
        }

        return Promise.resolve();
    }

    private processTimeline(room: MatrixRoom, timeline: RoomTimeline): void {
        if (!timeline.events) return;

        for (const event of timeline.events) {
            // First see if we need to update our state
            const stateEvent = <RoomStateEvent>event;
            if (stateEvent.state_key !== undefined) {
                //console.log("Updating state event " + stateEvent.type + " in " + room.id);

                // First remove the event we're replacing, if it exists
                if (stateEvent.unsigned && stateEvent.unsigned.replaces_state) {
                    const oldStateEvent = room.state.find(e => e.event_id === stateEvent.unsigned.replaces_state);
                    if (oldStateEvent) room.removeStateEvent(oldStateEvent);
                }

                // Remove anything that matches the type+state_key combo
                const toRemove = room.state.filter(e => e.type === stateEvent.type && e.state_key === stateEvent.state_key);
                toRemove.forEach(e => room.removeStateEvent(e));

                room.addStateEvent(stateEvent);
            }

            // Now process the event as a regular timeline event
            room.addTimelineEvent(event);
        }
    }
}