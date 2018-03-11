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