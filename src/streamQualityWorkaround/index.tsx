import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      {
        ext: "spacepack",
        id: "spacepack"
      },
      {
        ext: "common",
        id: "stores"
      },
    ],
    entrypoint: true
  },
};
