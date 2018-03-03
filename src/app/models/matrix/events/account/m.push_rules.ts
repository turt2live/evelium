import { AccountDataEvent } from "./account-data-event";

export interface PushRulesEvent extends AccountDataEvent {
    type: "m.push_rules";
    content: {
        device: any; // TODO: Determine
        global: any; // TODO: Determine
    };
}