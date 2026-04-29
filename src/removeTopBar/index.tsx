import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  // Hide titlebar and extract buttons
  {
    find: "showNotificationsInbox",
    replace: {
      match: /(?<=[}"]\);)(?=return.+?trailing:\(0,\i\.jsxs\)\(\i\.Fragment,{children:(\[.*?\)\]))/,
      replacement: (_, buttons) => `require("removeTopBar_entrypoint").storeButtons(${buttons}); return null;`
    }
  },
  // Adjust margins for removed title bar
  {
    find: "guildsnav",
    replace: {
      match: /role:"tree",/,
      replacement: (orig: string) => `${orig}style: {marginTop: "var(--space-8)"},`
    }
  },
  // Add buttons
  {
    find: "getDefaultDoubleClickAction",
    replace: {
      match: /(?<=,\{children:\[.*?)(?=\])/,
      replacement: () => `,require("removeTopBar_entrypoint").getIcons()`
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
        ext: "common",
        id: "ErrorBoundary"
      },
    ],
    entrypoint: true
  }
};
