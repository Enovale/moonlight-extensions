import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      { ext: "spacepack", id: "spacepack" },
      { ext: "componentEditor", id: "chatButtonList" },
      { ext: "common", id: "stores" },
      { ext: "common", id: "ErrorBoundary" },
      { id: "discord/components/common/index" },
      "CHAT_INPUT_BUTTON_NOTIFICATION,width",
      ",spriteContainer:",
      "discord/actions/MessageActionCreators"
    ],
    entrypoint: true
  }
};
