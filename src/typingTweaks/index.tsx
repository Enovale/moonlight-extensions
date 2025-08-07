import { ExtensionWebExports } from "@moonlight-mod/types";

const patchFind = "StKTho,{";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: patchFind,
    hardFail: true,
    replace: [
      {
        // Style the indicator and add function call to modify the children before rendering
        match: /(?<="aria-atomic":!0,children:)\i/,
        replacement: `require("typingTweaks_entrypoint").renderTypingUsers({ users: arguments[0]?.typingUserObjects, guildId: arguments[0]?.channel?.guild_id, children: $& })`
      },
      {
        match: /(?<=function \i\(\i\)\{)(?=[^}]+?\{channel:\i,isThreadCreation:\i=!1\})/,
        replacement: `let typingUserObjects = require("typingTweaks_entrypoint").useTypingUsers(arguments[0]?.channel);`
      },
      {
        // Get the typing users as user objects instead of names
        match: /typingUsers:(\i)\?\[\]:\i,/,
        // check by typeof so if the variable is not defined due to other patch failing, it won't throw a ReferenceError
        replacement: "$&typingUserObjects: $1 || typeof typingUserObjects === 'undefined' ? [] : typingUserObjects,"
      },
      {
        // users.length > 3 && (component = intl(key))
        match: /(&&\(\i=)(\i\.\i\.format\(\i\.\iQ8lUnJ,\{\}\))/,
        replacement: `$1moonlight.getConfigOption("typingTweaks", "alternativeFormatting") ? require("typingTweaks_entrypoint").buildSeveralUsers({ users: arguments[0]?.typingUserObjects, count: arguments[0]?.typingUserObjects?.length - 2, guildId: arguments[0]?.channel?.guild_id }) : $2`
      }
    ]
  },
  // https://github.com/Equicord/Equicord/blob/main/src/equicordplugins/amITyping/index.ts
  {
    find: `"handleDismissInviteEducation"`,
    replace: {
      match: /\i\.default\.getCurrentUser\(\)/,
      replacement: `moonlight.getConfigOption("typingTweaks", "showSelfTyping") ? null : $&`
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      {
        ext: "common",
        id: "stores"
      },
      {
        ext: "common",
        id: "ErrorBoundary"
      },
      {
        id: "discord/components/common/index"
      },
      {
        id: "discord/actions/UserProfileModalActionCreators"
      },
    ],
    entrypoint: true
  },
};