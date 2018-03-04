import { HttpClient } from "@angular/common/http";
import { MatrixAuthService } from "./auth.service";
import { Observable } from "rxjs/Observable";

export class AuthenticatedApi {
    constructor(protected http: HttpClient, protected auth: MatrixAuthService) {
    }

    protected get<T>(url: string, qs: any = null): Observable<T> {
        const headers = {
            "Authorization": "Bearer " + this.auth.accessToken,
        };
        return this.http.get<T>(url, {
            params: qs,
            headers: headers,
        });
    }

    protected post<T>(url: string, body: any = null): Observable<T> {
        const headers = {
            "Authorization": "Bearer " + this.auth.accessToken,
        };
        return this.http.post<T>(url, body, {
            headers: headers,
        });
    }

    protected put<T>(url: string, body: any = null): Observable<T> {
        const headers = {
            "Authorization": "Bearer " + this.auth.accessToken,
        };
        return this.http.put<T>(url, body, {
            headers: headers,
        });
    }

    protected delete<T>(url: string, qs: any = null): Observable<T> {
        const headers = {
            "Authorization": "Bearer " + this.auth.accessToken,
        };
        return this.http.delete<T>(url, {
            params: qs,
            headers: headers,
        });
    }
}