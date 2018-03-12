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

import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { AuthService } from "./auth.service";

/**
 * A class for handling authenticated calls as a service to the matrix API
 */
export class AuthenticatedApi {
    constructor(protected http: HttpClient, protected auth: AuthService) {
    }

    /**
     * Performs a GET request to a given endpoint. This will automatically append/overwrite any required
     * authentication headers/parameters.
     * @param {string} url The URL to call.
     * @param {*} qs An optional query string to include with the request.
     * @returns {Observable<T>} The result of the call.
     */
    protected get<T>(url: string, qs: any = null): Observable<T> {
        const headers = {
            "Authorization": "Bearer " + this.auth.accessToken,
        };
        return this.http.get<T>(url, {
            params: qs,
            headers: headers,
        });
    }

    /**
     * Performs a POST request to a given endpoint. This will automatically append/overwrite any required
     * authentication headers/parameters.
     * @param {string} url The URL to call.
     * @param {*} body An optional body to include with the request.
     * @returns {Observable<T>} The result of the call.
     */
    protected post<T>(url: string, body: any = null): Observable<T> {
        const headers = {
            "Authorization": "Bearer " + this.auth.accessToken,
        };
        return this.http.post<T>(url, body, {
            headers: headers,
        });
    }

    /**
     * Performs a PUT request to a given endpoint. This will automatically append/overwrite any required
     * authentication headers/parameters.
     * @param {string} url The URL to call.
     * @param {*} body An optional body to include with the request.
     * @returns {Observable<T>} The result of the call.
     */
    protected put<T>(url: string, body: any = null): Observable<T> {
        const headers = {
            "Authorization": "Bearer " + this.auth.accessToken,
        };
        return this.http.put<T>(url, body, {
            headers: headers,
        });
    }

    /**
     * Performs a DELETE request to a given endpoint. This will automatically append/overwrite any required
     * authentication headers/parameters.
     * @param {string} url The URL to call.
     * @param {*} qs An optional query string to include with the request.
     * @returns {Observable<T>} The result of the call.
     */
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

/**
 * An accessor to the matrix API without having to be a service.
 */
export class AuthenticatedApiAccess extends AuthenticatedApi {
    constructor(http: HttpClient, auth: AuthService) {
        super(http, auth);
    }

    /**
     * @see AuthenticatedApi#get
     */
    public get<T>(url: string, qs: any = null): Observable<T> {
        return super.get<T>(url, qs);
    }

    /**
     * @see AuthenticatedApi#post
     */
    public post<T>(url: string, body: any = null): Observable<T> {
        return super.post<T>(url, body);
    }

    /**
     * @see AuthenticatedApi#put
     */
    public put<T>(url: string, body: any = null): Observable<T> {
        return super.put<T>(url, body);
    }

    /**
     * @see AuthenticatedApi#delete
     */
    public delete<T>(url: string, qs: any = null): Observable<T> {
        return super.delete<T>(url, qs);
    }
}