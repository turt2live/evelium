import { Component, Input } from "@angular/core";
import { AvatarComponent } from "../avatar.component";
import { RoomMemberEvent } from "../../../models/matrix/events/room/state/m.room.member";
import { User } from "../../../models/matrix/dto/user";
import { MediaService } from "../../../services/matrix/media.service";
import { Room } from "../../../models/matrix/dto/room";

@Component({
    selector: "my-room-member-avatar",
    templateUrl: "../avatar.component.html",
    styleUrls: ["../avatar.component.scss"],
})
export class RoomMemberAvatarComponent extends AvatarComponent {

    @Input() public userId: string;
    @Input() public room: Room;
    @Input() public usePrevious: boolean;

    constructor(media: MediaService) {
        super(media)
    }

    public get mxcUrl(): string {
        if (!this.room) return null;

        const memberEvent = <RoomMemberEvent>this.room.state.find(e => e.type === "m.room.member" && e.state_key === this.userId);
        if (!memberEvent || !memberEvent.content) return null;

        if (this.usePrevious) {
            if (memberEvent.unsigned && memberEvent.unsigned.prev_content)
                return memberEvent.unsigned.prev_content.avatar_url;
        }

        return memberEvent.content.avatar_url;
    }

    public get displayName(): string {
        if (!this.room) return null;

        const members = this.room.state.filter(e => e.type === "m.room.member").map(e => <RoomMemberEvent>e);
        return User.getDisambiguatedName(this.userId, members, this.usePrevious);
    }
}
