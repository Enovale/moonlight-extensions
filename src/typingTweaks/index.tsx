import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: /"User Settings",/g,
    replace: {
      match: /"User Settings",/g,
      replacement: '"hacked by typingTweaks lol",'
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      {
        ext: "typingTweaks",
        id: "someLibrary"
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
        id: "discord/components/common/index"
      },
      {
        id: "discord/actions/UserProfileModalActionCreators"
      },
    ],
    entrypoint: true
  },

  someLibrary: {
    // Keep this object, even if it's empty! It's required for the module to be loaded.
  }
};
