import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: "bwLimitedFrameRate",
    replace: {
      match: /JSON\.parse.*?(\i)=\[\];.*?let\{screenshare:\i,camera:\i,audioDevice:\i\}=\i;/,
      replacement: (orig, rtpOut) => `${orig}require("streamQualityWorkaround_entrypoint").StreamStatsUpdate(${rtpOut});`
    }
  }
];

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
      "bwLimitedFrameRate"
    ],
    entrypoint: true
  },
};
