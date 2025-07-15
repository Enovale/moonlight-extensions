import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: '.banner)==null?"COMPLETE"',
    replace: {
      match: /(?<=void 0:)\i.getPreviewBanner\(\i,\i,\i\)/,
      replacement: `require("usrbg_entrypoint").patchBannerUrl(arguments[0])||$&`
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      { ext: "spacepack", id: "spacepack" },
    ],
    entrypoint: true
  }
};