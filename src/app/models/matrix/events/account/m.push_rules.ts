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

import { AccountDataEvent } from "./account-data-event";

export interface PushRulesEvent extends AccountDataEvent {
    type: "m.push_rules";
    content: PushRulesEventContent;
}

export interface PushRulesEventContent {
    device: any; // TODO: Determine

    global: {
        content: ContentPushRule[];
        override: OverridePushRule[];
        sender: SenderPushRule[]; // TODO: Determine
        room: RoomPushRule[];
        underride: UnderridePushRule[];

        // Order:
        // override  - user overrides
        // content   - unencrypted events, pattern is matched against ??
        // room      - all messages in a room. rule_id is always a room ID
        // sender    - all messages from a user ID. rule_id is always a user ID
        // underride - same as override, but low priority

        // Server default rules (.m*) operate at a lower priority than any other kind

        // Within a kind (property on this object), only execute the first matched rule
    };
}

export interface PushRule {
    enabled: boolean;
    default: boolean; // as in "server-default" or "predefined"
    kind: "content" | "override" | "room" | "sender" | "underride";
    actions: (PushRuleTweak | "dont_notify" | "notify" | "coalesce")[]; // Treat 'coalesce' as 'notify' for now
    rule_id: string
        // Predefined IDs ("server-default"):
        | ".m.rule.contains_user_name" | ".m.rule.master" | ".m.rule.suppress_notices" | ".m.rule.invite_for_me"
        | ".m.rule.member_event" | ".m.rule.contains_display_name" | ".m.rule.roomnotif" | ".m.rule.call"
        | ".m.rule.room_one_to_one" | ".m.rule.encrypted_room_one_to_one" | ".m.rule.message" | ".m.rule.encrypted";
}

export interface ContentPushRule extends PushRule {
    kind: "content";
    pattern: string; // glob
}

export interface OverridePushRule extends PushRule {
    kind: "override";
    conditions: PushRuleCondition[]; // none = always matches
}

export interface RoomPushRule extends PushRule {
    kind: "room";
}

export interface SenderPushRule extends PushRule {
    kind: "sender";
}

export interface UnderridePushRule extends PushRule {
    kind: "underride";
    conditions: PushRuleCondition[]; // none = always matches
}

export interface PushRuleTweak {
    set_tweak: string;
    value?: any;
}

export interface SoundTweak extends PushRuleTweak {
    set_tweak: "sound";
    value: "default" | "ring" | string; // 'default' == make noise
}

export interface HighlightTweak extends PushRuleTweak {
    set_tweak: "highlight";
    value?: boolean; // missing == true
}

export interface PushRuleCondition {
    // Type of check
    kind: "event_match" | "sender_notification_permission" | "room_member_count" |"contains_display_name";
}

export interface EventMatchCondition extends PushRuleCondition {
    kind: "event_match";
    key: string; // dot-separated field to check
    pattern: string; // glob - no glob chars means "contains"
}

export interface RoomMemberCountCondition extends PushRuleCondition {
    kind: "room_member_count";
    is: string; // "2", "<2", ">2", "==2", "<=2", ">=2" - no symbol implies ==
}

export interface ContainsDisplayNameCondition extends PushRuleCondition {
    kind: "contains_display_name";
}

export interface SenderNotificationPermissionCondition extends PushRuleCondition {
    kind: "sender_notification_permission";
}