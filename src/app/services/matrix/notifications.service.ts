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

import { AuthenticatedApi } from "./authenticated-api";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { Injectable } from "@angular/core";
import { AccountService } from "./account.service";
import { AccountDataEvent } from "../../models/matrix/events/account/account-data-event";
import { PushRulesEvent } from "../../models/matrix/events/account/m.push_rules";

// For singleton access
let notificationsHandler: NotificationsHandler;

// .m.rule.master - enabled=false means enabled
// .m.rule.suppress_notices - should be an override
//

@Injectable()
export class NotificationsService extends AuthenticatedApi {

    constructor(http: HttpClient, auth: AuthService, private account: AccountService) {
        super(http, auth);
    }

    private checkHandler(): void {
        if (!notificationsHandler) notificationsHandler = new NotificationsHandler(this.account);
    }

    public getPushRules(): any {
        this.checkHandler();
        return notificationsHandler.getPushRules();
    }
}

class NotificationsHandler {

    constructor(private account: AccountService) {

        account.accountData.events.subscribe(event => this.processPushRules(event));

        account.accountData.get("m.push_rules")
            .then(e => this.processPushRules(e)).catch(() => Promise.resolve()); // swallow errors
    }

    private processPushRules(evt: AccountDataEvent) {
        if (evt.type !== "m.push_rules") return;
        const rules = <PushRulesEvent>evt;

        console.log(rules);
    }

    public async getPushRules() {
        const rules = await this.account.accountData.get("m.push_rules");
        console.log(rules);
        return rules;
    }
}