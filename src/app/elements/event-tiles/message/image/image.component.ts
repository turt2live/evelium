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

import { Component } from "@angular/core";
import { EventTileComponentBase } from "../../event-tile.component.base";
import { MediaService } from "../../../../services/matrix/media.service";
import { RoomImageMessageEvent } from "../../../../models/matrix/events/room/m.room.message";

const MAX_WIDTH = 700;
const MIN_WIDTH = 200;
const MAX_HEIGHT = 300;
const MIN_HEIGHT = 60;

@Component({
    selector: "my-image-body-message-event-tile",
    templateUrl: "./image.component.html",
    styleUrls: ["./image.component.scss"]
})
export class ImageBody_MessageEventTileComponent extends EventTileComponentBase {

    public isLoading = true;
    public isError = false;

    constructor(private media: MediaService) {
        super();
    }

    public get imageEvent(): RoomImageMessageEvent {
        return <RoomImageMessageEvent>this.event;
    }

    public get style(): any {
        return {
            width: this.width + "px",
            height: this.height + "px",
        };
    }

    public get mxcUrl(): string {
        if (!this.imageEvent || !this.imageEvent.content || !this.imageEvent.content.url) {
            return null;
        }

        return this.imageEvent.content.url;
    }

    public get hasUrl(): boolean {
        const mxc = this.mxcUrl;
        if (!mxc) return false;
        return MediaService.isValidMxc(mxc);
    }

    public get thumbnailUrl(): string {
        if (!this.hasUrl) return null;
        return this.media.mxcToThumbnailUrl(this.mxcUrl, this.width, this.height, "scale");
    }

    public get downloadUrl(): string {
        if (!this.hasUrl) return null;
        return this.media.mxcToHttp(this.mxcUrl);
    }

    public get dimensions(): { width: number, height: number } {
        if (!this.imageEvent || !this.imageEvent.content || !this.imageEvent.content.info) {
            return {width: MAX_WIDTH, height: MAX_HEIGHT};
        }

        const width = Math.max(this.imageEvent.content.info.w || MAX_WIDTH, MIN_WIDTH);
        const height = Math.max(this.imageEvent.content.info.h || MAX_HEIGHT, MIN_HEIGHT);

        if (width <= MAX_WIDTH && height <= MAX_HEIGHT)return { width, height };

        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);

        return {
            width: Math.round(width * ratio),
            height: Math.round(height * ratio),
        };
    }

    public get width(): number {
        // shortcut property
        return this.dimensions.width;
    }

    public get height(): number {
        // shortcut property
        return this.dimensions.height;
    }

    public onImageLoaded() {
        this.isLoading = false;
        this.isError = false;
    }

    public onImageError() {
        this.isLoading = false;
        this.isError = true;
    }
}