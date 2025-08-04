import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: "--custom-emoji-sprite-size",
    replace: {
      match: /(?<=let \i=)Math.floor\(Math.random\(\)\*\i\)/,
      replacement: 'moonlight.getConfigOption("cleanChatBar","noRandomEmoji") ? 50 : $&'
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      { ext: "componentEditor", id: "chatButtonList" },
    ],
    entrypoint: true
  }
};
