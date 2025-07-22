import { UserStore } from "@moonlight-mod/wp/common_stores";

export function isCurrentUser(userId: string) {
    return userId === UserStore.getCurrentUser()?.id;
}

export function themeEffectAllowed(settingKey: string, userId: string) {
    if (isCurrentUser(userId))
        return true;

    return !moonlight.getConfigOption<boolean>("noProfileThemes", settingKey)!
}