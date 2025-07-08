import spacepack from "@moonlight-mod/wp/spacepack_spacepack";

export const Margins = spacepack.require("discord/styles/shared/Margins.css");
export const UserSummaryItem = spacepack.findByCode("defaultRenderUser", "showDefaultAvatarsForNullUsers")[0].exports.Z;
export const ApplicationStreamingStore = spacepack.findByCode("ApplicationStreamingStore")[0].exports.Z;
export const AvatarStyles = spacepack.findByCode("moreUsers:", "emptyUser:", "avatarContainer:", "clickableAvatar:")[0].exports;
export const i18n = spacepack.require("discord/intl");