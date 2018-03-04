import { Input } from "@angular/core";
import { MatrixMediaService } from "../../services/matrix/media.service";

export class AvatarComponent {

    @Input() public width: number;
    @Input() public height: number;
    @Input() public scaleMethod: "scale" | "crop";

    constructor(protected media: MatrixMediaService) {
    }

    public get style(): any {
        return {
            width: this.width + "px",
            height: this.height + "px",
            "line-height": this.height + "px",
            "font-size": (this.height * 0.65) + "px",
        };
    }

    public get mxcUrl(): string {
        return null;
    }

    public get displayName(): string {
        return "Unknown Avatar";
    }

    public get hasUrl(): boolean {
        const mxc = this.mxcUrl;
        if (!mxc) return false;
        return MatrixMediaService.isValidMxc(mxc);
    }

    public get avatarUrl(): string {
        if (!this.hasUrl) return null;
        return this.media.mxcToThumbnailUrl(this.mxcUrl, this.width, this.height, this.scaleMethod);
    }
}
