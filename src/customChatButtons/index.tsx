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
      { ext: "customChatButtons", id: "svgdata" },
      { ext: "customChatButtons", id: "settings" },
      { id: "react" },
      { ext: "spacepack", id: "spacepack" },
      { ext: "componentEditor", id: "chatButtonList" },
      { ext: "common", id: "stores" },
      { ext: "common", id: "ErrorBoundary" },
      { id: "discord/components/common/index" },
      { id: "discord/actions/MessageActionCreators" },
      { id: "discord/actions/ContextMenuActionCreators" },
      { ext: "contextMenu", id: "contextMenu" },
      ",expressionPickerPositionLayer:",
      "CHAT_INPUT_BUTTON_NOTIFICATION,width",
    ],
    entrypoint: true
  },

  settings: {
    dependencies: [
      { ext: "customChatButtons", id: "svgdata" },
      { ext: "customChatButtons", id: "svgPickerModal" },
      { ext: "spacepack", id: "spacepack" },
      { ext: "moonbase", id: "moonbase" },
      { ext: "settings", id: "settings" },
      { ext: "common", id: "ErrorBoundary" },
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
    dependencies: [
      { ext: "customChatButtons", id: "svgdata" },
      { id: "react" },
      { ext: "spacepack", id: "spacepack" },
      { id: "discord/components/common/index" },
      { id: "discord/uikit/legacy/Button" },
      { id: "discord/modules/modals/Modals" },
      { id: "discord/uikit/Flex" },
      { id: "discord/styles/shared/Margins.css" },
      { ext: "common", id: "ErrorBoundary" },
      "scrollbarGhostHairline:",
      "helperTextContainer:"
    ]
  },

  svgdata: {
    dependencies: [
      { id: "react" },
      { ext: "spacepack", id: "spacepack" },
      { ext: "common", id: "ErrorBoundary" },
      ",spriteContainer:",
    ]
  }
};
