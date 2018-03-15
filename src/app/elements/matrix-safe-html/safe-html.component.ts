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

import { Component, Input, OnChanges } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { MediaService } from "../../services/matrix/media.service";
import * as sanitizeHtml from "sanitize-html";

// This is largely based off the matrix-react-sdk
// https://github.com/matrix-org/matrix-react-sdk/blob/develop/src/HtmlUtils.js#L177
const SANITIZER_PARAMS = {
    allowedTags: [
        'font', // for IRC messages
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'sup', 'sub',
        'nl', 'li', 'b', 'i', 'u', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img', 'del',
    ],
    allowedAttributes: {
        // custom ones first:
        font: ['color', 'data-mx-bg-color', 'data-mx-color', 'style'], // custom to matrix
        span: ['data-mx-bg-color', 'data-mx-color', 'style'], // custom to matrix
        a: ['href', 'name', 'target', 'rel'], // remote target: custom to matrix
        img: ['src', 'width', 'height', 'alt', 'title'],
        ol: ['start'],
        code: ['class'], // Filtered in transformTags
    },
    selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
    allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'magnet'], // TODO: Make this part of a general utility
    allowProtocolRelative: false,
    transformTags: {
        // make all urls target _blank
        'a': (tagName: string, attributes: any) => {
            if (attributes['href']) {
                attributes['target'] = '_blank';

                // TODO: If/when we support matrix.to or our own URLs, add that parsing here.
            }

            attributes['rel'] = 'noopener'; // https://mathiasbynens.github.io/rel-noopener/
            return {tagName: tagName, attribs: attributes};
        },
        'img': (tagName: string, attributes: any) => {
            // Strip out any image source that isn't an MXC URL. We can do this
            // because transformTags are processed before the allowedSchemesByTag,
            // therefore we can safely prevent arbitrary urls.
            if (!attributes['src'] || !attributes['src'].startsWith("mxc://")) {
                return {tagName: tagName, attribs: {}}; // intentionally empty attributes
            }

            attributes['width'] = attributes['width'] || 800;
            attributes['height'] = attributes['height'] || 600;
            attributes['src'] = MediaService.convertMxcToThumbnailUrl(
                attributes['src'],
                attributes['width'],
                attributes['height'],
                'crop'
            );

            return {tagName: tagName, attribs: attributes};
        },
        'code': (tagName: string, attributes: any) => {
            if (typeof attributes['class'] !== 'undefined') {
                // Filter out all classes other than ones starting with language- for syntax highlighting.
                const classes = attributes['class'].split(/\s+/).filter(function (cl) {
                    return cl.startsWith('language-');
                });
                attributes['class'] = classes.join(' ');
            }

            return {tagName: tagName, attribs: attributes};
        },
        '*': (tagName: string, attributes: any) => {
            delete attributes['style']; // Just delete whatever is there - we're replacing it

            const colorRegex = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;

            const cssMap = {
                'data-mx-color': 'color',
                'data-mx-bg-color': 'background-color',
            };

            let style = "";
            for (const attr in cssMap) {
                const value = attributes[attr];
                if (value && typeof value === 'string' && colorRegex.test(value)) {
                    style += `${attr}: ${value};`;
                    delete attributes[attr];
                }
            }

            if (style) attributes['style'] = style;
            return {tagName: tagName, attribs: attributes};
        },
    }
};

@Component({
    selector: "my-matrix-safe-html",
    templateUrl: "./safe-html.component.html",
    styleUrls: ["./safe-html.component.scss"]
})
export class MatrixSafeHtmlComponent implements OnChanges {

    @Input() public dangerousHtml: string;

    public safeHtml: SafeHtml;

    constructor(private domSanitizer: DomSanitizer) {
    }

    public ngOnChanges() {
        this.safeHtml = this.domSanitizer.bypassSecurityTrustHtml(sanitizeHtml(this.dangerousHtml, SANITIZER_PARAMS));
    }
}