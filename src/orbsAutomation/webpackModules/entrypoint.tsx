import { ApplicationStreamingStore, RunningGameStore, QuestsStore, ChannelStore, GuildChannelStore } from "@moonlight-mod/wp/common_stores";
import Dispatcher from "@moonlight-mod/wp/discord/Dispatcher";
import Commands from "@moonlight-mod/wp/commands_commands";
import { InputType, CommandType } from "@moonlight-mod/types/coreExtensions/commands";
import {
    ScienceIcon,
    createToast,
    showToast
} from "@moonlight-mod/wp/discord/components/common/index";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import React from "@moonlight-mod/wp/react";
const { HTTP } = spacepack.require("discord/utils/HTTPUtils");
let PanelButton: (typeof import("@moonlight-mod/wp/discord/components/common/PanelButton"))["default"];
PanelButton = spacepack.require("discord/components/common/PanelButton").default;

// https://gist.github.com/aamiaa/204cd9d42013ded9faf646fae7f89fbb

const logger = moonlight.getLogger("orbsAutomation/entrypoint");

let isApp = !moonlightNode.isBrowser;
let currentlyCompletingQuest = false;

export function SpoofButton(quest, existing: any | undefined) {
    let button;
    if (QuestNeedsCompleting(quest))
        button = (
            <PanelButton className="orbsAutomation-spoof"
                tooltipText="Spoof Quest"
                icon={ScienceIcon}
                onClick={() => CompleteQuest(quest)} />
        );
    return existing ? [existing, button] : button;
}

export function QuestNeedsCompleting(quest) {
    return quest.id !== "1248385850622869556" && quest.userStatus?.enrolledAt && !quest.userStatus?.completedAt && new Date(quest.config.expiresAt).getTime() > Date.now()
}

export default function CompleteAvailableQuest() {
    let quest = [...QuestsStore.quests.values()].find(x => QuestNeedsCompleting);
    if (!quest) {
        showToast(createToast("You don't have any uncompleted quests!"));
        return;
    }

    CompleteQuest(quest);
}

export function CompleteQuest(quest) {
    if (currentlyCompletingQuest) {
        showToast(createToast("A quest is already being spoofed! Please wait"));
        return;
    } else if (!QuestNeedsCompleting(quest)) {
        showToast(createToast("Quest does not need completing!"));
        return;
    }

    currentlyCompletingQuest = true;
    try {
        const pid = Math.floor(Math.random() * 30000) + 1000;

        const applicationId = quest.config.application.id;
        const applicationName = quest.config.application.name;
        const questName = quest.config.messages.questName;
        const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
        const taskName = ["WATCH_VIDEO", "PLAY_ON_DESKTOP", "STREAM_ON_DESKTOP", "PLAY_ACTIVITY", "WATCH_VIDEO_ON_MOBILE"].find(x => taskConfig.tasks[x] != null);
        const secondsNeeded = taskConfig.tasks[taskName].target;
        let secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

        if (taskName === "WATCH_VIDEO" || taskName === "WATCH_VIDEO_ON_MOBILE") {
            const maxFuture = 10, speed = 7, interval = 1;
            const enrolledAt = new Date(quest.userStatus.enrolledAt).getTime();
            let completed = false;
            let fn = async () => {
                while (true) {
                    const maxAllowed = Math.floor((Date.now() - enrolledAt) / 1000) + maxFuture;
                    const diff = maxAllowed - secondsDone;
                    const timestamp = secondsDone + speed;
                    if (diff >= speed) {
                        const res = await HTTP.post({ url: `/quests/${quest.id}/video-progress`, body: { timestamp: Math.min(secondsNeeded, timestamp + Math.random()) } });
                        completed = res.body.completed_at != null;
                        secondsDone = Math.min(secondsNeeded, timestamp);
                    }

                    if (timestamp >= secondsNeeded) {
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, interval * 1000));
                }
                if (!completed) {
                    await HTTP.post({ url: `/quests/${quest.id}/video-progress`, body: { timestamp: secondsNeeded } });
                }
                showToast(createToast("Quest completed!"));
                logger.info("Quest completed!");
            };
            fn();
            logger.info(`Spoofing video for ${questName}.`);
        } else if (taskName === "PLAY_ON_DESKTOP") {
            if (!isApp) {
                logger.info("This no longer works in browser for non-video quests. Use the desktop app to complete the", questName, "quest!");
            } else {
                HTTP.get({ url: `/applications/public?application_ids=${applicationId}` }).then(res => {
                    const appData = res.body[0];
                    const exeName = appData.executables.find(x => x.os === "win32").name.replace(">", "");

                    const fakeGame = {
                        cmdLine: `C:\\Program Files\\${appData.name}\\${exeName}`,
                        exeName,
                        exePath: `c:/program files/${appData.name.toLowerCase()}/${exeName}`,
                        hidden: false,
                        isLauncher: false,
                        id: applicationId,
                        name: appData.name,
                        pid: pid,
                        pidPath: [pid],
                        processName: appData.name,
                        start: Date.now(),
                    };
                    const realGames = RunningGameStore.getRunningGames();
                    const fakeGames = [fakeGame];
                    const realGetRunningGames = RunningGameStore.getRunningGames;
                    const realGetGameForPID = RunningGameStore.getGameForPID;
                    RunningGameStore.getRunningGames = () => fakeGames;
                    RunningGameStore.getGameForPID = (pid) => fakeGames.find(x => x.pid === pid);
                    Dispatcher.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: realGames, added: [fakeGame], games: fakeGames });

                    let fn = data => {
                        let progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.PLAY_ON_DESKTOP.value);
                        logger.info(`Quest progress: ${progress}/${secondsNeeded}`);

                        if (progress >= secondsNeeded) {
                            logger.info("Quest completed!");

                            RunningGameStore.getRunningGames = realGetRunningGames;
                            RunningGameStore.getGameForPID = realGetGameForPID;
                            Dispatcher.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: [], games: [] });
                            Dispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
                        }
                    }
                    Dispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

                    logger.info(`Spoofed your game to ${applicationName}. Wait for ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`);
                })
            }
        } else if (taskName === "STREAM_ON_DESKTOP") {
            if (!isApp) {
                logger.info("This no longer works in browser for non-video quests. Use the desktop app to complete the", questName, "quest!");
            } else {
                let realFunc = ApplicationStreamingStore.getStreamerActiveStreamMetadata;
                ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({
                    id: applicationId,
                    pid,
                    sourceName: null
                });

                let fn = data => {
                    let progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.STREAM_ON_DESKTOP.value);
                    logger.info(`Quest progress: ${progress}/${secondsNeeded}`);

                    if (progress >= secondsNeeded) {
                        logger.info("Quest completed!");

                        ApplicationStreamingStore.getStreamerActiveStreamMetadata = realFunc;
                        Dispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
                    }
                }
                Dispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

                logger.info(`Spoofed your stream to ${applicationName}. Stream any window in vc for ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`);
                logger.info("Remember that you need at least 1 other person to be in the vc!");
            }
        } else if (taskName === "PLAY_ACTIVITY") {
            const channelId = ChannelStore.getSortedPrivateChannels()[0]?.id ?? Object.values(GuildChannelStore.getAllGuilds()).find(x => x != null && x.VOCAL.length > 0).VOCAL[0].channel.id;
            const streamKey = `call:${channelId}:1`;

            let fn = async () => {
                logger.info("Completing quest", questName, "-", quest.config.messages.questName);

                while (true) {
                    const res = await HTTP.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: false } });
                    const progress = res.body.progress.PLAY_ACTIVITY.value;
                    logger.info(`Quest progress: ${progress}/${secondsNeeded}`);

                    await new Promise(resolve => setTimeout(resolve, 20 * 1000));

                    if (progress >= secondsNeeded) {
                        await HTTP.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: true } });
                        break;
                    }
                }

                logger.info("Quest completed!");
            }
            fn();
        }
    }
    catch (e) {
        showToast(createToast("An error occured. Please check the console."));
        console.error(e);
    } finally {
        currentlyCompletingQuest = false;
    }
}

window.completeQuest = CompleteQuest;

Commands.registerCommand({
    id: "completeQuest",
    description: "Completes accepted quests!",
    inputType: InputType.BUILT_IN,
    type: CommandType.CHAT,
    options: [],
    execute: () => {
        CompleteAvailableQuest();
    }
});