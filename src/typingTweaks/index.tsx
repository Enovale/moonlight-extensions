import { ExtensionWebExports } from "@moonlight-mod/types";
import managedStyle from "./style.css?managed";

const patchFind = "StKTho,{";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: patchFind,
    replace: [
      {
        // Style the indicator and add function call to modify the children before rendering
        match: /(?<=children:\[(\i)\.length>0.{0,300}?"aria-atomic":!0,children:)\i/,
        replacement: `require("typingTweaks_entrypoint").renderTypingUsers({ users: $1, guildId: arguments[0]?.channel?.guild_id, children: $& })`
      },
      {
        // Changes the indicator to keep the user object when creating the list of typing users
        match: /\.map\((\i)=>\i\.\i\.getName\(\i(?:\.guild_id)?,\i\.id,\1\)\)/,
        replacement: ""
      },
      {
        // Adds the alternative formatting for several users typing
        match: /(,{a:(\i),b:(\i),c:\i}\):\i\.length>3&&\(\i=)\i\.\i\.string\(\i\.\iuVDhqa\)(?<=(\i)\.length.+?)/,
        replacement: (_, rest, a, b, users) =>
          `${rest}require("typingTweaks_entrypoint").buildSeveralUsers({ a: ${a}, b: ${b}, count: ${users}.length - 2, guildId: arguments[0]?.channel?.guild_id })`
      }
    ]
  },
  {
    find: patchFind,
    prerequisite: () => moonlight.getConfigOption<boolean>("typingTweaks", "alternativeFormatting")!,
    replace: [
      {
        // Adds the alternative formatting for several users typing
        match: /(,{a:(\i),b:(\i),c:\i}\):\i\.length>3&&\(\i=)\i\.\i\.string\(\i\.\iuVDhqa\)(?<=(\i)\.length.+?)/,
        replacement: (_, rest, a, b, users) =>
          `${rest}require("typingTweaks_entrypoint").buildSeveralUsers({ a: ${a}, b: ${b}, count: ${users}.length - 2, guildId: arguments[0]?.channel?.guild_id })`
      }
    ]
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

export const styles: ExtensionWebExports["styles"] = [
  managedStyle
];