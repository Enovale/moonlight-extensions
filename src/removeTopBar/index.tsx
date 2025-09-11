import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  // Hide titlebar and extract buttons
  {
    find: "showNotificationsInbox",
    replace: {
      match: /(?<=var \i,\i;)(?=return\(.+?trailing:\(0,\i\.jsxs\)\(\i\.Fragment,{children:(\[.*?\)\]))/,
      replacement: (_, buttons) => `require("removeTopBar_entrypoint").storeButtons(${buttons}); return null;`
    }
  },
  // Adjust margins for removed title bar
  {
    find: "guildsnav",
    replace: {
      match: /className:\i\.itemsContainer,/,
      replacement: (orig: string) => `${orig}style: {marginTop: "var(--space-8)"},`
    }
  },
  // Add buttons
  {
    find: `["isAuthenticated"]`,
    replace: {
      match: /\.toggleParticipantsList\(\i,!\i\)}\)]}\)/,
      replacement: (orig: string) => `${orig},require("removeTopBar_entrypoint").getIcons()`
    }
  },
  // Add icons to voice chat toolbar
  {
    find: "call-members-popout",
    replace: {
      match: /(?<=value:\i,children:)(\i)}/,
      replacement: (_, buttons) => `[require("removeTopBar_entrypoint").getIcons(),...${buttons}]}`
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      {
        id: "react"
      },
      {
        ext: "common",
        id: "stores"
      },
      {
        id: "discord/components/common/index"
      },
      {
        ext: "common",
        id: "ErrorBoundary"
      },
    ],
    entrypoint: true
  }
};