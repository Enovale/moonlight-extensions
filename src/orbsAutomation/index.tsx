import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  // Prevent orbs videos from rendering
  {
    find: "[QV] | updatePlayerState | playerState:",
    replace: {
      match: /videoInner.*?\}\),/,
      replacement: (orig) => `${orig}style: {display: 'none'},`
    }
  },
  {
    find: "questEnrollmentBlockedUntil}))",
    replace: [
      // Make quest var accessible
      {
        match: /let\{quest:(\i),(.*?=\i,)/,
        replacement: (_, quest, middle) => `let{quest: ${quest},${middle}questVar = ${quest},`
      },
      // Replace button arrays
      {
        match: /(\.Fragment,.*?)\[(\(.*?children:\i}\))\]/,
        replacement: (_, before, after) => `${before}[${after}, require("orbsAutomation_entrypoint").SpoofButton(questVar)]`,
      },
      // Replace single buttons
      {
        match: /(\(0,\i\.jsx\).{1,50}?\.BRAND,.{1,50}?\i\.button,.{1,50}?children:\i}\)):/g,
        replacement: (_, self) => `require("orbsAutomation_entrypoint").SpoofButton(questVar, ${self}):`
      }
    ]
  },
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      { ext: "spacepack", id: "spacepack" },
      { ext: "common", id: "stores" },
      { id: "discord/components/common/index" },
      { id: "discord/components/common/PanelButton" },
      { id: "discord/Dispatcher" },
      { id: "discord/utils/HTTPUtils" },
    ],
    entrypoint: true
  },
};
