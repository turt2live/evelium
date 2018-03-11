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

import { RoomEvent, SimpleRoomEvent } from "./room-event";

export interface FileInfo {
    mimetype?: string;
    size?: number;
}

export interface ImageInfoBase extends FileInfo {
    h?: number;
    w?: number;
}

export interface ThumbnailInfo {
    thumbnail_url?: string; // mxc
    thumbnail_info?: ImageInfoBase;
}

export interface ImageInfo extends ImageInfoBase, ThumbnailInfo {
}

export interface AudioFileInfo extends FileInfo {
    duration: number; // ms
}

export interface VideoInfo extends ImageInfo {
    duration: number; // ms
}

export interface RoomMessageEvent extends RoomEvent {
    type: "m.room.message";

    content: {
        msgtype: string;
        body: string;

        // Other fields as required (see interfaces below)
    };
}

export interface RoomTextMessageEvent extends RoomMessageEvent {
    content: {
        msgtype: "m.text" | "m.emote";
        body: string;

        format?: "org.matrix.custom.html" | string;
        formatted_body?: string;
    };
}

export interface RoomEmoteMessageEvent extends RoomTextMessageEvent {
    // It's the same thing, so we'll just go with it
}

export interface RoomNoticeMessageEvent extends RoomMessageEvent {
    content: {
        msgtype: "m.notice";
        body: string;

        format?: "org.matrix.custom.html" | string;
        formatted_body?: string;

        // We support https://github.com/matrix-org/matrix-doc/pull/828
        status?: "info" | "warning" | "error" | "critical";
    };
}

export interface RoomImageMessageEvent extends RoomMessageEvent {
    content: {
        msgtype: "m.image";
        body: string; // usually the file name

        url: string; // mxc
        info?: ImageInfo;
    };
}

export interface RoomVideoMessageEvent extends RoomMessageEvent {
    content: {
        msgtype: "m.video",
        body: string; // usually the file name

        url: string; // mxc
        info?: VideoInfo;
    };
}

export interface RoomLocationMessageEvent extends RoomMessageEvent {
    content: {
        msgtype: "m.location";
        body: string; // usually a description of the location, eg: Big Ben, UK

        geo_uri: string;
        info?: ThumbnailInfo;

        // TODO: Implement https://github.com/matrix-org/matrix-doc/pull/919
    };
}

export interface RoomFileMessageEvent extends RoomMessageEvent {
    content: {
        msgtype: "m.file";
        body: string; // usually the file name

        filename: string; // original uploaded file name
        url: string; // mxc
        info?: FileInfo;
    }
}

export interface RoomAudioMessageEvent extends RoomMessageEvent {
    content: {
        msgtype: "m.audio";
        body: string; // usually the file name

        url: string; // mxc
        info?: AudioFileInfo;
    };
}

export class SimpleRoomMessageEvent extends SimpleRoomEvent<"m.room.message"> implements RoomTextMessageEvent {
    constructor(message: string) {
        super("m.room.message", {
            msgtype: "m.text",
            body: message,
        });
    }
}