import {
    Margins,
    ApplicationStreamingStore,
    AvatarStyles,
    i18n
} from "./components";
import { User } from "@moonlight-mod/types";
import { Clickable, FormTitle, Tooltip, FormText } from "@moonlight-mod/wp/discord/components/common/index";
import UserSummaryItem from "@moonlight-mod/wp/discord/components/common/UserSummaryItem";
import { openUserProfileModal } from "@moonlight-mod/wp/discord/actions/UserProfileModalActionCreators";
import { UserStore, RelationshipStore, GuildMemberStore } from "@moonlight-mod/wp/common_stores";
import { useStateFromStores } from "@moonlight-mod/wp/discord/packages/flux";
import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";
import Flex from "@moonlight-mod/wp/discord/uikit/Flex";
import React from "@moonlight-mod/wp/react";

type WatchingProps = {
    userIds: string[];
    guildId?: string;
};

function cl(str: string) {
    return "whosWatching-" + str;
}

function classes(...classes: Array<string | null | undefined | false>) {
    return classes.filter(Boolean).join(" ");
}

function getUsername(user: any, guildId?: string): string {
    return RelationshipStore.getNickname(user.id) || guildId != null ? GuildMemberStore.getNick(guildId, user.id) : (user.globalName || user.username);
}

export function Watching({ userIds, guildId }: WatchingProps) {
    // Missing Users happen when UserStore.getUser(id) returns null
    // The client should automatically cache spectators, so this might not be possible but it's better to be sure just in case
    let missingUsers = 0;
    const users = userIds.map(id => UserStore.getUser(id)).filter(user => Boolean(user) ? true : (missingUsers += 1, false));
    return (
        <div className={cl("content")}>
            {userIds.length ?
                (<>
                    <FormTitle>{i18n.intl.format(i18n.t["BR7Tnp"], { numViewers: userIds.length })}</FormTitle>
                    <Flex direction={Flex.Direction.VERTICAL} style={{ gap: 6 }} >
                        {users.map(user => (
                            <Flex direction={Flex.Direction.HORIZONTAL} style={{ gap: 6, alignContent: "center" }} className={cl("user")} >
                                <img src={user.getAvatarURL(guildId)} style={{ borderRadius: 8, width: 16, height: 16 }} />
                                {getUsername(user, guildId)}
                            </Flex>
                        ))}
                        {missingUsers > 0 && <span className={cl("more_users")}>{`+${i18n.intl.format(i18n.t["3uHFUV"], { num: missingUsers })}`}</span>}
                    </Flex>
                </>)
                : (<span className={cl("no_viewers")}>No spectators</span>)}
        </div>
    );
}

export function IconHoverComponent({ OriginalComponent, ...props }) {
    const stream = useStateFromStores(
        [ApplicationStreamingStore],
        () => ApplicationStreamingStore.getCurrentUserActiveStream()
    );
    if (!stream) return null;
    const viewers = ApplicationStreamingStore.getViewerIds(stream);
    return (
        <ErrorBoundary>
            <Tooltip text={<Watching userIds={viewers} guildId={stream.guildId} />}>
                {({ onMouseEnter, onMouseLeave }) => (
                    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                        <OriginalComponent {...props} />
                    </div>
                )}
            </Tooltip>
        </ErrorBoundary>
    );
}

export function ScreenshareWrapper(props) {
    const stream = useStateFromStores([ApplicationStreamingStore], () => ApplicationStreamingStore.getCurrentUserActiveStream());
    if (!stream) return <div {...props}>{props.children}</div>;

    const userIds: string[] = ApplicationStreamingStore.getViewerIds(stream);
    let missingUsers = 0;
    const users = userIds.map(id => UserStore.getUser(id)).filter(user => Boolean(user) ? true : (missingUsers += 1, false));

    function renderMoreUsers(_label: string, count: number) {
        const sliced = users.slice(count - 1);
        return (
            <Tooltip text={<Watching userIds={userIds} guildId={stream.guildId} />}>
                {({ onMouseEnter, onMouseLeave }) => (
                    <div
                        className={AvatarStyles.moreUsers}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                    >
                        +{sliced.length + missingUsers}
                    </div>
                )}
            </Tooltip>
        );
    }

    return (
        <>
            <div {...props}>{props.children}</div>
            <div className={classes(cl("spectators_panel"), Margins.marginTop8)}>
                {users.length ?
                    <>
                        <FormTitle tag="h3" style={{ marginTop: 8, marginBottom: 0, textTransform: "uppercase" }}>
                            {i18n.intl.format(i18n.t["BR7Tnp"], { numViewers: userIds.length })}
                        </FormTitle>
                        <UserSummaryItem
                            users={users}
                            count={userIds.length}
                            guildId={stream.guildId}
                            renderIcon={false}
                            max={12}
                            showDefaultAvatarsForNullUsers
                            renderMoreUsers={renderMoreUsers}
                            renderUser={(user: User) => (
                                <Tooltip text={getUsername(stream.guildId, user.id)}>
                                    {({ onMouseEnter, onMouseLeave }) => (
                                        <div
                                            className={cl("user_summary_icon")}
                                            onMouseEnter={onMouseEnter}
                                            onMouseLeave={onMouseLeave}>
                                            <Clickable
                                                className={AvatarStyles.clickableAvatar}
                                                onClick={() => openUserProfileModal({ userId: user.id })}
                                            >
                                                <img
                                                    className={AvatarStyles.avatar}
                                                    src={user.getAvatarURL(void 0, 80, true)}
                                                    alt={user.username}
                                                    title={user.username}
                                                />
                                            </Clickable>
                                        </div>
                                    )}
                                </Tooltip>
                            )}
                        />
                    </>
                    : <FormText>No spectators</FormText>
                }
            </div>
        </>
    );
}