import { greeting } from "@moonlight-mod/wp/typingTweaks_someLibrary";
import { GuildMemberStore, RelationshipStore } from "@moonlight-mod/wp/common_stores";
import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";
import React from "@moonlight-mod/wp/react";
import { User } from "@moonlight-mod/types";
import { Avatar } from "@moonlight-mod/wp/discord/components/common/index";
import { openUserProfileModal } from "@moonlight-mod/wp/discord/actions/UserProfileModalActionCreators";

interface TypingUserProps {
    user: User;
    guildId: string;
}

interface SeveralTypingUsersProps {
    a: User;
    b: User;
    count: number;
    guildId: string;
}

function typingUserColor(guildId: string, userId: string): string | undefined {
    if (!moonlight.getConfigOption<boolean>("typingTweaks", "showRoleColors")) return;

    return GuildMemberStore.getMember(guildId, userId)?.colorString;
}

function TypingUser({ user, guildId }: TypingUserProps) {
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

export function buildSeveralUsers({ a, b, count, guildId }: SeveralTypingUsersProps) {
    return (
        <>
            <TypingUser user={a} guildId={guildId} />
            {", "}
            <TypingUser user={b} guildId={guildId} />
            {", "}
            and {count} others are typing...
        </>
    );
}

export function renderTypingUsers({ guildId, users, children }: React.PropsWithChildren<{ guildId: string, users: User[]; }>) {
    try {
        if (!Array.isArray(children)) {
            return children;
        }

        let element = 0;

        return children.map(c => {
            if (c.type !== "strong" && !(typeof c !== "string" && !React.isValidElement(c)))
                return c;

            const user = users[element++];
            return <TypingUser key={user.id} guildId={guildId} user={user} />;
        });
    } catch (e) {
        console.error(e);
    }

    return children;
}