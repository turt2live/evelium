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

import { ErrorHandler, Injector, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { FormsModule } from "@angular/forms";
import { routing } from "./app.routing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { UiSwitchModule } from "angular2-ui-switch";
import { ToasterModule } from "angular2-toaster";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BootstrapModalModule } from "ngx-modialog/plugins/bootstrap";
import { ModalModule } from "ngx-modialog";
import { LocatorService } from "./services/locator.service";
import { LandingComponent } from "./views/landing/landing.component";
import { SpinnerComponent } from "./elements/spinner/spinner.component";
import { LoggedInComponent } from "./views/logged-in/logged-in.component";
import { LoginComponent } from "./views/login/login.component";
import { HttpClientModule } from "@angular/common/http";
import { RoomListComponent } from "./views/room-list/room-list.component";
import { RoomListTagComponent } from "./views/room-list/tag/tag.component";
import { RoomListTileComponent } from "./views/room-list/tile/tile.component";
import {
    PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface,
    PerfectScrollbarModule
} from 'ngx-perfect-scrollbar';
import { RoomComponent } from "./views/room/room.component";
import { RoomAvatarComponent } from "./elements/avatar/room/room.component";
import { RoomHeaderComponent } from "./views/room/header/header.component";
import { RoomMessageComposerComponent } from "./views/room/composer/composer.component";
import { MessageEventTileComponent } from "./elements/event-tiles/message/message.component";
import { RoomMemberAvatarComponent } from "./elements/avatar/room-member/room-member.component";
import { EventTileComponent } from "./elements/event-tiles/event-tile.component";
import { MemberEventTileComponent } from "./elements/event-tiles/member/member.component";
import { AppErrorHandler } from "./app.error-handler";
import { RoomInterfaceComponent } from "./views/logged-in/room-interface/room-interface.component";
import { HomepageComponent } from "./views/logged-in/homepage/homepage.component";
import { AccountService } from "./services/matrix/account.service";
import { AuthService } from "./services/matrix/auth.service";
import { HomeserverService } from "./services/matrix/homeserver.service";
import { RoomService } from "./services/matrix/room.service";
import { SyncService } from "./services/matrix/sync.service";
import { MediaService } from "./services/matrix/media.service";
import { TextBody_MessageEventTileComponent } from "./elements/event-tiles/message/text/text.component";
import { NoticeBody_MessageEventTileComponent } from "./elements/event-tiles/message/notice/notice.component";
import { EmoteBody_MessageEventTileComponent } from "./elements/event-tiles/message/emote/emote.component";
import { ImageBody_MessageEventTileComponent } from "./elements/event-tiles/message/image/image.component";
import { FileSizePipe } from "./pipes/file-size.pipe";
import * as Showdown from "showdown";
import showdown = require("showdown");
import { MatrixSafeHtmlComponent } from "./elements/matrix-safe-html/safe-html.component";

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {};
const SHOWDOWN_CONVERTER = new showdown.Converter();

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        routing,
        NgbModule.forRoot(),
        UiSwitchModule,
        ToasterModule,
        BrowserAnimationsModule,
        ModalModule.forRoot(),
        BootstrapModalModule,
        PerfectScrollbarModule,
    ],
    declarations: [
        AppComponent,
        LandingComponent,
        SpinnerComponent,
        LoggedInComponent,
        LoginComponent,
        RoomListComponent,
        RoomListTagComponent,
        RoomListTileComponent,
        RoomComponent,
        RoomAvatarComponent,
        RoomHeaderComponent,
        RoomMessageComposerComponent,
        MessageEventTileComponent,
        RoomMemberAvatarComponent,
        EventTileComponent,
        MemberEventTileComponent,
        RoomInterfaceComponent,
        HomepageComponent,
        TextBody_MessageEventTileComponent,
        NoticeBody_MessageEventTileComponent,
        EmoteBody_MessageEventTileComponent,
        ImageBody_MessageEventTileComponent,
        FileSizePipe,
        MatrixSafeHtmlComponent,

        // Vendor
    ],
    providers: [
        {provide: Window, useValue: window},
        {provide: Storage, useValue: localStorage},
        {provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG},
        {provide: ErrorHandler, useClass: AppErrorHandler},
        {provide: Showdown.Converter, useValue: SHOWDOWN_CONVERTER},
        AccountService,
        AuthService,
        HomeserverService,
        MediaService,
        RoomService,
        SyncService,

        // Vendor
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        // Event tiles
        MessageEventTileComponent,
        MemberEventTileComponent,

        // Event tile bodies
        TextBody_MessageEventTileComponent,
        NoticeBody_MessageEventTileComponent,
        EmoteBody_MessageEventTileComponent,
        ImageBody_MessageEventTileComponent,
    ]
})
export class AppModule {
    constructor(injector: Injector) {
        LocatorService.injector = injector;
    }
}
