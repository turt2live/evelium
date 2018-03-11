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

export const ROOMS_DB = "evelium.sync";
export const ACCOUNT_DATA_DB = "evelium.account_data";
export const SCHEMA_VERSION = "1"; // intentionally a string

export async function checkDatabases(): Promise<any> {
    // TODO: Avoid having a full-blown /sync reset due to old/bad schema
    // We should really be using the migration functions in each class, however for major changes we
    // need to reset ourselves somehow. This is just one way of doing it.
    if (localStorage.getItem("mx.schemaVersion") !== SCHEMA_VERSION) {
        console.log("Resetting databases due to outdated schema version");

        return new Promise<any>((resolve, reject) => {
            const request = indexedDB.deleteDatabase(ROOMS_DB);
            request.onsuccess = resolve;
            request.onerror = reject;
        }).then(() => new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(ACCOUNT_DATA_DB);
            request.onsuccess = resolve;
            request.onerror = reject;
        })).then(() => {
            localStorage.removeItem("mx.syncToken");
            localStorage.setItem("mx.schemaVersion", SCHEMA_VERSION);
        });
    }
}