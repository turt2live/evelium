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

import "@angular/platform-browser";
import "@angular/platform-browser-dynamic";
import "@angular/core";
import "@angular/common";
import "@angular/http";
import "@angular/router";
import "rxjs";
import fontawesome from '@fortawesome/fontawesome';
import solid from '@fortawesome/fontawesome-free-solid';
import regular from '@fortawesome/fontawesome-free-regular';
import brands from '@fortawesome/fontawesome-free-brands';
import * as showdown from 'showdown';

fontawesome.library.add(regular, solid, brands);

const showdownOptions = {
    omitExtraWLInCodeBlocks: true,
    noHeaderId: true,
    customizedHeaderId: false,
    parseImgDimensions: true,
    headerLevelStart: 3,
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs: true,
    literalMidWordUnderscores: true,
    literalMidWordAsterisks: true,
    strikethrough: true,
    tables: true,
    ghCodeBlocks: true,
    tasklists: true, // We'll disable the checkboxes in the html
    disableForced4SpacesIndentedSublists: true,
    simpleLineBreaks: true,
    requireSpaceBeforeHeadingText: true,
    backslashEscapesHTMLTags: true, // TODO: Verify this is actually what we want
    emoji: true, // Until we have a better library
    splitAdjacentBlockquotes: true, // Maybe?
};

for (const opt of Object.keys(showdownOptions)) {
    showdown.setOption(opt, showdownOptions[opt]);
}
showdown.setFlavor("github");
