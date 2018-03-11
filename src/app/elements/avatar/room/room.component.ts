import { Component, Input } from "@angular/core";
import { AvatarComponent } from "../avatar.component";
import { Room } from "../../../models/matrix/dto/room";
import { MediaService } from "../../../services/matrix/media.service";

@Component({
    selector: "my-room-avatar",
    templateUrl: "../avatar.component.html",
    styleUrls: ["../avatar.component.scss"],
})
export class RoomAvatarComponent extends AvatarComponent {

    @Input() public room: Room;

    constructor(media: MediaService) {
        super(media)
    }

    public get mxcUrl(): string {
        return this.room ? this.room.avatarMxc : null;
    }

    public get displayName(): string {
        return this.room ? this.room.displayName : "Empty Room";
    }
}
