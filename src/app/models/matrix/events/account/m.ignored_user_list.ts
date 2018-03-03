import { AccountDataEvent } from "./account-data-event";

export interface IgnoredUsersEvent extends AccountDataEvent {
    type: "m.ignored_user_list";
    content: {
        [userId: string]: {}; // currently an empty object
    };
}