import { ExtensionWebExports } from "@moonlight-mod/types";
import { inboxFind, bugFind } from "./webpackModules/finds";

const mainToolbarFind = "toolbar:function";
const guildsFind = "guildsnav";
const titleBarFind = "TITLE_BAR_LEFT&&";
const callToolbarFind = 'call-members-popout';

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: titleBarFind,
    replace: {
      match: /return \i\?null:\(/,
      replacement: "return true ? null : ("
    }
  },
  // Adjust margins for removed title bar
  {
    find: guildsFind,
    replace: {
      match: /className:\i\.itemsContainer,/,
      replacement: (orig: any) => `${orig}style: {marginTop: "16px"},`
    }
  },
  {
    find: mainToolbarFind,
    replace: {
      match: /(function \i\(\i\){)(.{1,200}toolbar.{1,450}mobileToolbar)/,
      replacement: (_, before, after) => `${before}require("removeTopBar_entrypoint").addIconToToolBar(arguments[0]);${after}`
    }
  },
  // Add icons to voice chat toolbar
  {
    find: callToolbarFind,
    replace: {
      match: /(\i)=\[\]/,
      replacement: (_, varName) => `${varName} = [require("removeTopBar_entrypoint").getIcons()]`
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      {
        id: "react"
      },
      {
        ext: "spacepack",
        id: "spacepack"
      },
      {
        ext: "common",
        id: "stores"
      },
      {
        id: "discord/components/common/index"
      },
      {
        ext: "common",
        id: "ErrorBoundary"
      },
      mainToolbarFind,
      guildsFind,
      titleBarFind,
      callToolbarFind,
      inboxFind,
      bugFind
    ],
    entrypoint: true
  }
};
