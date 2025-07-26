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
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      { ext: "spacepack", id: "spacepack" },
      { ext: "common", id: "stores" },
      { id: "discord/Dispatcher" },
      { id: "discord/utils/HTTPUtils" },
    ],
    entrypoint: true
  },
};
