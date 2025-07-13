import { greeting } from "@moonlight-mod/wp/typingTweaks_someLibrary";
import managedStyle from "./style.css?managed";
import { GuildMemberStore, RelationshipStore } from "@moonlight-mod/wp/common_stores";
import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";
import React from "@moonlight-mod/wp/react";
import { User } from "@moonlight-mod/types";
import { Avatar } from "@moonlight-mod/wp/discord/components/common/index";
import { openUserProfileModal } from "@moonlight-mod/wp/discord/actions/UserProfileModalActionCreators";

const logger = moonlight.getLogger("typingTweaks/entrypoint");
logger.info("Hello from entrypoint!");
logger.info("someLibrary exports:", greeting);

const natives = moonlight.getNatives("typingTweaks");
logger.info("node exports:", natives);

interface Props {
    user: User;
    guildId: string;
}

function typingUserColor(guildId: string, userId: string): string | undefined {
    if (!moonlight.getConfigOption<boolean>("typingTweaks", "showRoleColors")) return;

    return GuildMemberStore.getMember(guildId, userId)?.colorString;
}

function typingUser({ user, guildId }: Props) {
    return (
        <ErrorBoundary>
            <strong
                className="vc-typing-user"
                role="button"
                onClick={() => {
                    openUserProfileModal(user.id);
                }}
                style={{
                    color: moonlight.getConfigOption<boolean>("typingTweaks", "showRoleColors") ? typingUserColor(guildId, user.id) : undefined,
                }}
            >
                {moonlight.getConfigOption<boolean>("typingTweaks", "showAvatars") && (
                    <Avatar
                        size="SIZE_16"
                        src={user.getAvatarURL(guildId, 128)} />
                )}
                {GuildMemberStore.getNick(guildId!, user.id)
                    || (!guildId && RelationshipStore.getNickname(user.id))
                    || (user as any).globalName
                    || user.username
                }
            </strong>
        </ErrorBoundary>
    );
}