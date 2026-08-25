import spacepack from "@moonlight-mod/wp/spacepack_spacepack";

export const Margins = spacepack.require("discord/styles/shared/Margins.css");
export const i18n = spacepack.require("discord/intl");

/**
 * Pick an export out of the first module a find matches.
 *
 * These lookups run while the module is being evaluated, so `findByCode(...)[0].exports`
 * throws the moment a find stops matching, and the module never registers. Anything
 * patched in then requires a module that does not exist, which takes the client down
 * rather than switching one feature off.
 */
function findExport<T>(finds: string[], pick?: (value: any) => boolean): T | undefined {
  const mod = spacepack.findByCode(...finds)[0];
  if (mod == null) return undefined;

  const values = Object.values(mod.exports ?? {});
  return (pick != null ? values.find(pick) : values[0]) as T | undefined;
}

export const UserSummaryItem = findExport<any>(
  ["defaultRenderUser", "showDefaultAvatarsForNullUsers"],
  (value) => typeof value === "function" || typeof value?.render === "function"
);

/*
 * Chosen by the methods it has to have rather than by an export name. This used to read
 * `.exports.Z`, which is webpack's older key for a default export; current builds use `A`
 * or `Ay`, so the name is not something to rely on.
 */
export const ApplicationStreamingStore = findExport<any>(
  ["ApplicationStreamingStore"],
  (value) => typeof value?.getViewerIds === "function"
);

/** Class names only. An empty object leaves the list unstyled instead of unavailable. */
export const AvatarStyles: Record<string, string> =
  findExport<Record<string, string>>(["moreUsers:", "emptyUser:", "avatarContainer:", "clickableAvatar:"]) ?? {};
