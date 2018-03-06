import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatrixHomeserverService } from "./homeserver.service";
import { AuthenticatedApi } from "./authenticated-api";
import { MatrixAuthService } from "./auth.service";
import { AccountDataEvent } from "../../models/matrix/events/account/account-data-event";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { Observable } from "rxjs/Observable";

@Injectable()
export class MatrixAccountService extends AuthenticatedApi {

    private static ACCOUNT_DATA: { [eventType: string]: AccountDataEvent } = {};
    private static ACCOUNT_DATA_STREAM = new ReplaySubject<AccountDataEvent>();

    constructor(http: HttpClient, auth: MatrixAuthService,
                private hs: MatrixHomeserverService,
                private localStorage: Storage) {
        super(http, auth);

        const raw = this.localStorage.getItem("mx.accountData");
        if (raw) {
            const parsed = <AccountDataEvent[]>JSON.parse(raw);
            parsed.forEach(e => this.setAccountData(e, true, false));
        }
    }

    public getAccountDataStream(): Observable<AccountDataEvent> {
        return MatrixAccountService.ACCOUNT_DATA_STREAM;
    }

    public getAccountData<T extends AccountDataEvent>(eventType: string): T {
        return <T>MatrixAccountService.ACCOUNT_DATA[eventType];
    }

    public setAccountData(event: AccountDataEvent, cacheOnly = false, persistCache = true): Promise<any> {
        const oldEvent = this.getAccountData(event.type);
        MatrixAccountService.ACCOUNT_DATA[event.type] = event;
        MatrixAccountService.ACCOUNT_DATA_STREAM.next(event);
        if (persistCache) this.persistAccountData();
        if (cacheOnly) return Promise.resolve(); // Stop here

        return this.put(this.hs.buildCsUrl(`user/${this.auth.userId}/account_data/${event.type}`, event.content)).toPromise().then(() => {
            console.log("Successfully saved account data: " + event.type);
        }).catch(e => {
            console.error(e);
            MatrixAccountService.ACCOUNT_DATA[event.type] = oldEvent;
            MatrixAccountService.ACCOUNT_DATA_STREAM.next(oldEvent); // Send the reverted event
            this.persistAccountData();
            return Promise.reject(e); // re-throw
        });
    }

    private persistAccountData() {
        const flat = Object.keys(MatrixAccountService.ACCOUNT_DATA).map(type => MatrixAccountService.ACCOUNT_DATA[type]);
        this.localStorage.setItem("mx.accountData", JSON.stringify(flat));
    }
}