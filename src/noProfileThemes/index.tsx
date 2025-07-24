import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: "hasThemeColors(){",
    replace: [
      // Premium customization (accents, border, etc)
      {
        match: /get canUsePremiumProfileCustomization\(\){return /,
        replacement: (orig) => `${orig}require("noProfileThemes_entrypoint").themeEffectAllowed("premiumProfile", this.userId)&&`
      },
      // Profile effect overlay
      {
        match: /(this.popoutAnimationParticleType=)(.*?)(,this.fetchStartedAt)/,
        replacement: (_, before, orig, after) => `${before}require("noProfileThemes_entrypoint").themeEffectAllowed("profileEffect", this.userId) ? (${orig}) : null${after}`
      }
    ]
  },
  {
    find: "discord/records/UserRecord",
    replace: [
      // Remove all nameplates
      {
        match: /get nameplate\(\){/,
        replacement: (orig) => `${orig}if (!require("noProfileThemes_entrypoint").themeEffectAllowed("nameplate", this.id)) return null;`
      },
      // Remove Avatar Decorations
      {
        match: /get avatarDecoration\(\){/,
        replacement: (orig) => `${orig}if (!require("noProfileThemes_entrypoint").themeEffectAllowed("profileDecoration", this.id)) return null;`
      }
    ]
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  entrypoint: {
    dependencies: [
      {
        ext: "common",
        id: "stores"
      },
      {
        id: "discord/records/UserRecord"
      }
    ],
    entrypoint: true
  }
};
