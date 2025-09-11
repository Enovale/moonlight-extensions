/// <reference types="@moonlight-mod/types" />

declare module "@moonlight-mod/wp/customChatButtons_settings" {
  export * from "src/customChatButtons/webpackModules/settings";
}

declare module "@moonlight-mod/wp/customChatButtons_svgdata" {
  export * from "src/customChatButtons/webpackModules/svgdata";
}

declare module "@moonlight-mod/wp/customChatButtons_svgPickerModal" {
  import openSvgPickerModal from "src/customChatButtons/webpackModules/svgPickerModal";
  export = openSvgPickerModal;
  //export * from "src/customChatButtons/webpackModules/svgPickerModal";
}
