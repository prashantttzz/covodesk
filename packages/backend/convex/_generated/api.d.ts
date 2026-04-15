/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as http from "../http.js";
import type * as lib_constant from "../lib/constant.js";
import type * as lib_extractTextContent from "../lib/extractTextContent.js";
import type * as private_contactsession from "../private/contactsession.js";
import type * as private_conversation from "../private/conversation.js";
import type * as private_files from "../private/files.js";
import type * as private_messages from "../private/messages.js";
import type * as private_plugins from "../private/plugins.js";
import type * as private_secret from "../private/secret.js";
import type * as private_vapi from "../private/vapi.js";
import type * as private_widgetSetting from "../private/widgetSetting.js";
import type * as public_contactSession from "../public/contactSession.js";
import type * as public_conversations from "../public/conversations.js";
import type * as public_messages from "../public/messages.js";
import type * as public_organization from "../public/organization.js";
import type * as public_secret from "../public/secret.js";
import type * as public_vapi from "../public/vapi.js";
import type * as public_widgetSettings from "../public/widgetSettings.js";
import type * as system_ContactSession from "../system/ContactSession.js";
import type * as system_ai_SupportAgent from "../system/ai/SupportAgent.js";
import type * as system_ai_rag from "../system/ai/rag.js";
import type * as system_conversation from "../system/conversation.js";
import type * as system_plugins from "../system/plugins.js";
import type * as system_secret from "../system/secret.js";
import type * as system_subscription from "../system/subscription.js";
import type * as system_tools_escalateConversation from "../system/tools/escalateConversation.js";
import type * as system_tools_resolveConversation from "../system/tools/resolveConversation.js";
import type * as system_tools_searchTool from "../system/tools/searchTool.js";
import type * as system_widgetSetting from "../system/widgetSetting.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  http: typeof http;
  "lib/constant": typeof lib_constant;
  "lib/extractTextContent": typeof lib_extractTextContent;
  "private/contactsession": typeof private_contactsession;
  "private/conversation": typeof private_conversation;
  "private/files": typeof private_files;
  "private/messages": typeof private_messages;
  "private/plugins": typeof private_plugins;
  "private/secret": typeof private_secret;
  "private/vapi": typeof private_vapi;
  "private/widgetSetting": typeof private_widgetSetting;
  "public/contactSession": typeof public_contactSession;
  "public/conversations": typeof public_conversations;
  "public/messages": typeof public_messages;
  "public/organization": typeof public_organization;
  "public/secret": typeof public_secret;
  "public/vapi": typeof public_vapi;
  "public/widgetSettings": typeof public_widgetSettings;
  "system/ContactSession": typeof system_ContactSession;
  "system/ai/SupportAgent": typeof system_ai_SupportAgent;
  "system/ai/rag": typeof system_ai_rag;
  "system/conversation": typeof system_conversation;
  "system/plugins": typeof system_plugins;
  "system/secret": typeof system_secret;
  "system/subscription": typeof system_subscription;
  "system/tools/escalateConversation": typeof system_tools_escalateConversation;
  "system/tools/resolveConversation": typeof system_tools_resolveConversation;
  "system/tools/searchTool": typeof system_tools_searchTool;
  "system/widgetSetting": typeof system_widgetSetting;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  rag: import("@convex-dev/rag/_generated/component.js").ComponentApi<"rag">;
};
