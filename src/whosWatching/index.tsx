import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: ".Masks.STATUS_SCREENSHARE,width:32",
    replace: {
      match: /jsx\)\((\i\.\i),{mask:/,
      // Falls back to the component being wrapped. An unguarded require here turns a
      // module that failed to evaluate into a crash on every screenshare.
      replacement: (orig, origComponent) =>
        `jsx)(require("whosWatching_index")?.IconHoverComponent??${origComponent},` +
        `{OriginalComponent: ${origComponent},mask:`
    }
  },
  {
    // New panel patch
    find: "this.renderEmbeddedActivity()",
    replace: {
      match: /(?<=let{canGoLive.{0,500}\()"div"(?=,{className:\i\.body)/,
      // Falls back to the plain div this replaces.
      replacement: (orig: any) => `(require("whosWatching_index")?.ScreenshareWrapper??"div")`
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  index: {
    dependencies: [
      {
        id: "discord/components/common/index"
      },
      {
        id: "discord/components/common/UserSummaryItem"
      },
      {
        id: "discord/actions/UserProfileModalActionCreators"
      },
      {
        id: "react"
      },
      {
        id: "discord/packages/flux"
      },
      {
        id: "discord/intl"
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
        ext: "common",
        id: "ErrorBoundary"
      },
      {
        id: "discord/uikit/Flex"
      },
    ]
  }
};
