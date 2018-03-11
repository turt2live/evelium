import { AccountDataEvent } from "./account-data-event";

export interface PushRulesEvent extends AccountDataEvent {
    type: "m.push_rules";
    content: PushRulesEventContent;
}

export interface PushRulesEventContent {
    // TODO: Determine

    device: any;
    global: any;
}