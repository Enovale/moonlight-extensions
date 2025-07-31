import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: "discord/utils/AvatarUtils",
    replace: {
      match: /(getUserAvatarURL:)(\i),/,
      replacement: (_, before, original) => `${before}require("userpfp_entrypoint").getAvatarHook(${original}),`
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    entrypoint: true
  },
};
