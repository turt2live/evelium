import { RoomStateEvent } from "../events/room/state/room-state-event";
import { RoomNameEvent } from "../events/room/state/m.room.name";
import { RoomMemberEvent } from "../events/room/state/m.room.member";
import { RoomCanonicalAliasEvent } from "../events/room/state/m.room.canonical_alias";
import { User } from "./user";
import { Observable } from "rxjs/Observable";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { MatrixAuthService } from "../../../services/matrix/auth.service";
import { RoomAvatarEvent } from "../events/room/state/m.room.avatar";
import { RoomTopicEvent } from "../events/room/state/m.room.topic";
import { IncompleteRoomEvent, RoomEvent } from "../events/room/room-event";

export interface RoomUpdatedEvent {
    room: MatrixRoom;
    property: string;
}

export class MatrixRoom {
    public static readonly UPDATED_STREAM: Observable<RoomUpdatedEvent> = new ReplaySubject<RoomUpdatedEvent>();

    public backfillToken: string;

    constructor(private _roomId: string,
                private _isDirect: boolean,
                private _state: RoomStateEvent[],
                private _timeline: RoomEvent[] = [],
                private _pendingEvents: IncompleteRoomEvent[] = []) {
    }

    public get id(): string {
        return this._roomId;
    }

    public get rawDisplayName(): string {
        const event = <RoomNameEvent>this.state.find(e => e.type === "m.room.name");
        return event && event.content ? event.content.name : undefined;
    }

    public get avatarMxc(): string {
        const event = <RoomAvatarEvent>this.state.find(e => e.type === "m.room.avatar");
        if (!event || !event.content || !event.content.url) {
            const joinedMembers = this.state.filter(e => e.type === "m.room.member")
                .map(e => <RoomMemberEvent>e)
                .filter(e => e.state_key !== MatrixAuthService.USER_ID)
                .filter(e => e.content && (e.content.membership === "invite" || e.content.membership === "join"));
            if (joinedMembers.length === 1) return joinedMembers[0].content.avatar_url;
        }
        return event && event.content ? event.content.url : undefined;
    }

    public get topic(): string {
        const event = <RoomTopicEvent>this.state.find(e => e.type === "m.room.topic");
        return event && event.content ? event.content.topic : undefined;
    }

    public get isDirect(): boolean {
        return this._isDirect;
    }

    public get state(): RoomStateEvent[] {
        return this._state;
    }

    public get timeline(): RoomEvent[] {
        return this._timeline;
    }

    public get pendingEvents(): IncompleteRoomEvent[] {
        return this._pendingEvents;
    }

    public set isDirect(isDirect: boolean) {
        const old = this._isDirect;
        this._isDirect = isDirect;
        if (old !== this._isDirect) this.publishUpdate('isDirect');
    }

    public set state(state: RoomStateEvent[]) {
        const old = this._state;
        this._state = state;
        if (old !== this._state) this.publishUpdate('state');
    }

    public set timeline(timeline: RoomEvent[]) {
        const old = this._timeline;
        this._timeline = timeline;
        if (old !== this._timeline) this.publishUpdate('timeline');
    }

    public set pendingEvents(pendingEvents: IncompleteRoomEvent[]) {
        const old = this._pendingEvents;
        this._pendingEvents = pendingEvents;
        if (old !== this._pendingEvents) this.publishUpdate('pendingEvents');
    }

    private publishUpdate(property: string): void {
        (<ReplaySubject<RoomUpdatedEvent>>MatrixRoom.UPDATED_STREAM).next({
            room: this,
            property: property,
        });
    }

    public get displayName(): string {
        const selfUserId = MatrixAuthService.USER_ID;

        const nameEvent = <RoomNameEvent>this._state.find(e => e.type === "m.room.name");
        if (nameEvent && nameEvent.content && nameEvent.content.name) return nameEvent.content.name;

        const canonicalAliasEvent = <RoomCanonicalAliasEvent>this._state.find(e => e.type === "m.room.canonical_alias");
        if (canonicalAliasEvent && canonicalAliasEvent.content && canonicalAliasEvent.content.alias)
            return canonicalAliasEvent.content.alias;

        const allMembers = this._state.filter(e => e.type === "m.room.member").map(e => <RoomMemberEvent>e);
        const joinedMembers = allMembers
            .filter(e => e.content && (e.content.membership === "join" || e.content.membership === "invite"))
            .filter(e => e.state_key !== selfUserId);

        if (joinedMembers.length === 0) {
            const leftMembers = allMembers.filter(e => e.state_key !== selfUserId)
                .sort((a, b) => a.state_key.localeCompare(b.state_key));

            if (leftMembers.length === 0) {
                return "Empty Room";
            }
            if (leftMembers.length === 1) {
                return "Empty Room (was " + User.getDisambiguatedName(leftMembers[0].state_key, allMembers) + ")";
            }

            return `Empty Room (was ${User.getDisambiguatedName(leftMembers[0].state_key, allMembers)} and ${leftMembers.length - 1} other${leftMembers.length - 1 !== 1 ? 's' : ''}`;
        }

        if (joinedMembers.length === 1) {
            return User.getDisambiguatedName(joinedMembers[0].state_key, allMembers);
        }

        let sortedJoinedMembers = joinedMembers.sort((a, b) => a.state_key.localeCompare(b.state_key));
        if (sortedJoinedMembers.length === 2) {
            return `${User.getDisambiguatedName(sortedJoinedMembers[0].state_key, allMembers)} and ${User.getDisambiguatedName(sortedJoinedMembers[1].state_key, allMembers)}`;
        }

        if (sortedJoinedMembers.length > 2) {
            return `${User.getDisambiguatedName(sortedJoinedMembers[0].state_key, allMembers)} and ${joinedMembers.length - 1} other${joinedMembers.length - 1 !== 1 ? 's' : ''}`;
        }
    }

    public addStateEvent(event: RoomStateEvent): void {
        this.state.push(event);
        this.publishUpdate("state");
    }

    public removeStateEvent(event: RoomStateEvent): void {
        const idx = this.state.indexOf(event);
        if (idx !== -1) {
            this.state.splice(idx, 1);
            this.publishUpdate("state");
        }
    }

    public addTimelineEvent(event: RoomEvent): void {
        this.timeline.push(event);
        this.publishUpdate("timeline");
    }

    public removeTimelineEvent(event: RoomEvent): void {
        const idx = this.timeline.indexOf(event);
        if (idx !== -1) {
            this.timeline.splice(idx, 1);
            this.publishUpdate("timeline");
        }
    }

    public addAllToTimeline(events: RoomEvent[]): void {
        for (const event of events) this.timeline.push(event);
        this.publishUpdate("timeline");
    }

    public addPendingEvent(event: IncompleteRoomEvent): void {
        this.pendingEvents.push(event);
        this.publishUpdate("pendingEvents");
    }

    public removePendingEvent(event: IncompleteRoomEvent): void {
        const idx = this.pendingEvents.indexOf(event);
        if (idx !== -1) {
            this.pendingEvents.splice(idx, 1);
            this.publishUpdate("pendingEvents");
        }
    }
}