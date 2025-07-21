import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: ".EIYbj4)", // USER_PROFILE_ENTRY_POINTS_AMP_UP_YOUR_PROFILE
    replace: [
      {
        match: /}\);return \i\?.*?}\)}}/,
        replacement: "});return null}}"
      }
    ],
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      {
        ext: "common",
        id: "stores"
      }
    ],
    entrypoint: true
  },
};