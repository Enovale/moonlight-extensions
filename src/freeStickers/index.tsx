import type { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  // Make stickers always available
  {
    find: /canUseCustomStickersEverywhere:(\w+)/,
    replace: [{
      match: /canUseCustomStickersEverywhere:(\w+),/,
      replacement: 'canUseCustomStickersEverywhere: () => true,'
    }]
  },
  {
    find: '"SENDABLE"',
    replace: {
      match: /\i\.available\?/,
      replacement: "true?"
    }
  },
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      { ext: "common", id: "stores" },
      { ext: 'spacepack', id: 'spacepack' },
      "=!0,showLargeMessageDialog:"
    ],
    entrypoint: true
  },
};