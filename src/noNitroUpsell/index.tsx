import { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  // I don't actually know what this is patching out
  {
    find: ".EIYbj4)", // USER_PROFILE_ENTRY_POINTS_AMP_UP_YOUR_PROFILE
    replace:
    {
      match: /}\);return \i\?.*?}\)}}/,
      replacement: "});return null}}"
    }
  },
  // Insane regex to wrap the SKU feature checking function and pass the original value as well.
  {
    find: "ProductCatalog.tsx",
    replace:
    {
      match: /(function \i\((\i),(\i)\).*let \i=(\i\[\i.premiumType\]).*let \i=(\i\[\i\]).*)return \i.skuFeatures.includes\(\i\)/,
      replacement: (_, before, feature, user, tierList, skuSupport) => `${before}return require("noNitroUpsell_entrypoint").checkRealSkuSupport(${feature}, ${user}, ${skuSupport.replace(/\[.*\]/, `[${tierList.replace("premiumType", "_realPremiumType")}]`)})`
    }
  },
  // The nitro filesize is checked separately so we must patch it explicitly
  {
    find: ".premiumType].fileSize",
    replace:
    {
      match: /.premiumType/g,
      replacement: "._realPremiumType"
    }
  },
  // Manually patch out profile customization upsell
  {
    find: "UserSettingsProfileCustomization",
    replace: [
      {
        match: /showUpsell:.*?,/,
        replacement: "showUpsell: false,"
      },
      {
        match: /active:(\i),.*?shouldShow:\i.*?isVisible:(\i)}/,
        replacement: (orig, eu, el) => orig.replaceAll(eu, "false").replaceAll(el, "false")
      }
    ]
  },
  // Per-profile customization upsell
  {
    find: "upsellOverlay,",
    replace:
    {
      match: /(showOverlay:(\i).*?;)(return\(\i\.useEffect)/,
      replacement: (_, before, overlay, after) => `${before}${overlay} = false;${after}`
    }
  },
  // Special exception to this patch for the entitlement gifts, as they are server validated
  // TODO This patch is broken on Canary
  {
    find: "EntitlementGifts",
    replace:
    {
      match: /\(\)=>(\i\.\i\.isPremiumExactly\((\i\..*?User\(\)).*?TIER_2\))/,
      replacement: (_, origCheck, user) => `() => require("noNitroUpsell_entrypoint").checkRealSkuSupport("canAcceptGifts", ${user}, (${origCheck}))`
    }
  },
  // Removes the collectibles upsell in the Profiles tab
  {
    find: /COLLECTIBLES_PROFILE_SETTINGS_UPSELL.*?PREMIUM_UPSELL_VIEWED/,
    replace:
    {
      match: /Z:\(\)=>\i/,
      replacement: "Z: () => () => null"
    }
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
      "EntitlementGifts"
    ],
    entrypoint: true
  },
};