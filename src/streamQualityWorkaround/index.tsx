import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: "bwLimitedFrameRate",
    replace: {
      match: /JSON\.parse.*?(\i)=\[\];.*?let\{screenshare:\i,camera:\i,audioDevice:\i\}=\i;/,
      replacement: (orig, rtpOut) => `${orig}require("streamQualityWorkaround_entrypoint").StreamStatsUpdate(${rtpOut});`
    }
  },
  {
    find: "Send Join Invite",
    replace: {
      match: /(panelButtonContainer)(,children:)(\(.*?icon:\i\}\))/,
      replacement: (orig, css, before, after) => `${css} + " streamQuality-interact"${before}[require("streamQualityWorkaround_entrypoint").ActionsWrapper(),${after}]`
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      { ext: "spacepack", id: "spacepack" },
      { ext: "common", id: "stores"},
      { id: "discord/components/common/PanelButton" },
      { id: "react" },
      "bwLimitedFrameRate"
    ],
    entrypoint: true
  },
};
