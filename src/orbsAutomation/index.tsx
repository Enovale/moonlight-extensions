import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  // Prevent orbs videos from rendering and playing sound
  {
    find: "[QV] | updatePlayerState | playerState:",
    replace: [
      {
        match: /(?<=videoInner.*?\}\)),/,
        replacement: `,style: {display: 'none'},`
      },
      {
        match: /(?<=\(\i=>)\i.muted/,
        replacement: `true`
      },
    ]
  },
  {
    find: "questEnrollmentBlockedUntil}))",
    replace: [
      // Make quest var accessible
      {
        match: /let\{quest:(\i),(.*?=\i,)/,
        replacement: (_, quest, middle) => `let{quest: ${quest},${middle}questVar = ${quest},`
      },
      // Replace single buttons
      {
        match: /\(0,\i\.jsx\).{1,30}?\.button,children:\(.{1,30}?\"secondary\",disabled:.{1,70}?\}\)\}\)/,
        replacement: (orig) => `require("orbsAutomation_entrypoint").SpoofButton({ quest: questVar, existing: ${orig} })`
      },
      // Replace Video Watch Button
      {
        match: /\(0,\i\.jsx\).{1,30}?\.button,children:\(.{1,30}?\"primary\",onClick:.{1,70}?\}\)\}\)/,
        replacement: (orig) => `require("orbsAutomation_entrypoint").SpoofButton({ quest: questVar, existing: ${orig} })`
      },
      // Replace array
      {
        match: /(platformSelectorSecondary,.+?DESKTOP:.+?CONSOLE:.+?size:.+?\}\))(?:\])/,
        replacement: (_, start) => `${start}, require("orbsAutomation_entrypoint").SpoofButton({ quest: questVar })]`
      },
      /*
      // Replace button arrays
      {
        match: /(\.Fragment,.*?)\[(\(.*?children:\i}\))\]/,
        replacement: (_, before, after) => `${before}[${after}, require("orbsAutomation_entrypoint").SpoofButton({ quest: questVar })]`,
      },
      // Replace single buttons
      {
        match: /(\(0,\i\.jsx\).{1,50}?\.(BRAND|PRIMARY),.{1,50}?\i\.button,.{0,50}?children:(.{0,10}?\i|\i\.intl\.string\(.*?\)(?:\]?))+}\)):/g,
        replacement: (_, self) => `require("orbsAutomation_entrypoint").SpoofButton({ quest: questVar, existing: ${self} }):`
      }
      */
    ]
  },
  // Add spoof button to video playback modal
  {
    find: "contentFooterButtonCont,children",
    replace: [
      // Make quest var accessible
      {
        match: /(let\{.*?)onClose:(\i),quest:(\i),(.*?=\i,)/,
        replacement: (_, before, onClose, quest, middle) => `${before}onClose: ${onClose}, quest: ${quest},${middle}questVar = ${quest},onCloseVar = ${onClose},`
      },
      {
        match: /(?<=contentFooter.*?contentFooterButtonCont(.*?)\[)(?=.*?\"secondary\".*?(?:claimBtn|portraitCtaBtn))/g,
        replacement: `require("orbsAutomation_entrypoint").SpoofButton({ quest: questVar, callback: onCloseVar }), `
      }
    ]
  },
  // Quest accepted banner over the user bar in the bottom left
  {
    find: ".questAcceptedHeader",
    replace: [
      // Make quest var accessible
      {
        match: /let\{quest:(\i),(.*?=\i,)/,
        replacement: (_, quest, middle) => `let{quest: ${quest},${middle}questVar = ${quest},`
      },
      {
        match: /(?<=\.questAcceptedHeader,children:\[.*?\}\)\}\)),/,
        replacement: `, require("orbsAutomation_entrypoint").SpoofButton({ quest: questVar, small: true }), `
      }
    ]
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      { ext: "spacepack", id: "spacepack" },
      { ext: "common", id: "stores" },
      { id: "discord/components/common/index" },
      { id: "discord/components/common/PanelButton" },
      { id: "discord/Dispatcher" },
      { id: "discord/utils/HTTPUtils" },
    ],
    entrypoint: true
  },
};
