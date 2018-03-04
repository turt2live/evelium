import { Component, Input } from "@angular/core";
import { MatrixRoom } from "../../../models/matrix/dto/room";
import { MatrixMediaService } from "../../../services/matrix/media.service";
import { AvatarComponent } from "../avatar.component";

@Component({
    selector: "my-room-avatar",
    templateUrl: "../avatar.component.html",
    styleUrls: ["../avatar.component.scss"],
})
export class RoomAvatarComponent extends AvatarComponent {

    @Input() public room: MatrixRoom;

    constructor(media: MatrixMediaService) {
        super(media)
    }

    public get mxcUrl(): string {
        return this.room ? this.room.avatarMxc : null;
    }

    public get displayName(): string {
        return this.room ? this.room.displayName : "Empty Room";
    }
}
