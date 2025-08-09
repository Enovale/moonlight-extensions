import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  // Allow context menu to work on chat buttons
  {
    find: ".CHAT_INPUT_BUTTON_NOTIFICATION,width:",
    replace: {
      // Don't add patch if it's already been added by other extensions
      match: /(?<!onContextMenu),onClick:(\i)\?void 0:/,
      replacement: (orig, disabled) => `,onContextMenu:${disabled}?void 0:arguments[0].onContextMenu${orig}`
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      { ext: "spacepack", id: "spacepack" },
      { ext: "componentEditor", id: "chatButtonList" },
      { ext: "common", id: "stores" },
      { ext: "common", id: "ErrorBoundary" },
      { id: "discord/components/common/index" },
      { ext: "contextMenu", id: "contextMenu" },
      "CHAT_INPUT_BUTTON_NOTIFICATION,width",
      ",spriteContainer:",
      "discord/actions/MessageActionCreators"
    ],
    entrypoint: true
  },

  settings: {
    dependencies: [
      { ext: "customChatButtons", id: "entrypoint" },
      { ext: "spacepack", id: "spacepack" },
      { ext: "moonbase", id: "moonbase" },
      { ext: "settings", id: "settings" },
      { id: "discord/components/common/index" },
      { id: "discord/uikit/TextInput" },
      { id: "discord/uikit/legacy/Button" },
      { id: "discord/uikit/Flex" },
      { id: "discord/styles/shared/Margins.css" },
      { id: "discord/modules/markup/MarkupUtils" },
      { id: "react" },
      { ext: "moonbase", id: "ui" },
      ':"USER_SETTINGS_MODAL_SET_SECTION"'
    ]
  },

  svgPickerModal: {

  }
};
