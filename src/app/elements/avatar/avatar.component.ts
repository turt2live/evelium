/*
 *     Evelium - A matrix client
 *     Copyright (C)  2018 Travis Ralston
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Input } from "@angular/core";
import { MediaService } from "../../services/matrix/media.service";

export class AvatarComponent {

    @Input() public width = 32;
    @Input() public height = 32;
    @Input() public scaleMethod: "scale" | "crop" = "crop";

    public showPlaceholder = true;

    constructor(protected media: MediaService) {
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
        return MediaService.isValidMxc(mxc);
    }

    public get avatarUrl(): string {
        if (!this.hasUrl) return null;
        return this.media.mxcToThumbnailUrl(this.mxcUrl, this.width, this.height, this.scaleMethod);
    }

    public onImageLoaded() {
        this.showPlaceholder = false;
    }

    public onImageError() {
        this.showPlaceholder = true;
    }
}
