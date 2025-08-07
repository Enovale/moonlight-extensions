import { GuildMemberStore, RelationshipStore, TypingStore, UserStore, AuthenticationStore } from "@moonlight-mod/wp/common_stores";
import { useStateFromStores } from "@moonlight-mod/wp/discord/packages/flux";
import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";
import React from "@moonlight-mod/wp/react";
import { User, Channel } from "@moonlight-mod/types";
import { Avatar } from "@moonlight-mod/wp/discord/components/common/index";
import { openUserProfileModal } from "@moonlight-mod/wp/discord/actions/UserProfileModalActionCreators";

const logger = moonlight.getLogger("typingTweaks/entrypoint");

interface TypingUserProps {
    user: User;
    guildId: string;
}

interface SeveralTypingUsersProps {
    users: User[];
    count: number;
    guildId: string;
}

function showRoleColors() {
    return moonlight.getConfigOption<boolean>("colorConsistency", "typing") ?? false;
}

function typingUserColor(guildId: string, userId: string): string | undefined {
    return GuildMemberStore.getMember(guildId, userId)?.colorString;
}

function TypingUser({ user, guildId }: TypingUserProps) {
    return (
        <ErrorBoundary noop={true}>
            <strong
                className="vc-typing-user"
                role="button"
                onClick={() => {
                    openUserProfileModal(user.id);
                }}
                style={{
                    color: showRoleColors() ? typingUserColor(guildId, user.id) : undefined,
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

export function buildSeveralUsers({ users, count, guildId }: SeveralTypingUsersProps) {
    return (
        <ErrorBoundary noop={true}>
            {users.slice(0, count).map(user => (
                <React.Fragment key={user.id}>
                    <TypingUser user={user} guildId={guildId} />
                    {", "}
                </React.Fragment>
            ))}
            and {count} others are typing...
        </ErrorBoundary>
    );
}

export function renderTypingUsers({ guildId, users, children }: React.PropsWithChildren<{ guildId: string, users: User[]; }>) {
    try {
        if (!Array.isArray(children)) {
            return children;
        }

        let element = 0;

        return <ErrorBoundary noop={true}>
            {children.map(c => {
                if (c.type !== "strong" && !(typeof c !== "string" && !React.isValidElement(c)))
                    return c;

                const user = users[element++];
                return <TypingUser key={user.id} guildId={guildId} user={user} />;
            })}
        </ErrorBoundary>
    } catch (e) {
        logger.error(e);
    }

    return <ErrorBoundary noop={true} children={children} />;
}

export function useTypingUsers(channel: Channel | undefined): User[] {
    try {
        if (!channel) {
            throw new Error("No channel");
        }

        const typingUsers = useStateFromStores([TypingStore], () => TypingStore.getTypingUsers(channel.id));
        const myId = useStateFromStores([AuthenticationStore], () => AuthenticationStore.getId());

        return Object.keys(typingUsers)
            .filter(id => id && (moonlight.getConfigOption<boolean>("typingTweaks", "showSelfTyping") || id !== myId) && !RelationshipStore.isBlockedOrIgnored(id))
            .map(id => UserStore.getUser(id))
            .filter(u => u != null);
    } catch (e) {
        logger.error("Failed to get typing users:", e);
        return [];
    }
}