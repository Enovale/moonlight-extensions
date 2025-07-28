import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import { MediaEngineStore, ApplicationStreamingSettingsStore } from "@moonlight-mod/wp/common_stores";
import { ScreenIcon } from "@moonlight-mod/wp/discord/components/common/index";
import React from "@moonlight-mod/wp/react";

export const AudioActionCreators = spacepack.findByCode("AudioActionCreators")[0].exports.Z;
let PanelButton: (typeof import("@moonlight-mod/wp/discord/components/common/PanelButton"))["default"];
PanelButton = spacepack.require("discord/components/common/PanelButton").default;

const logger = moonlight.getLogger("streamQualityWorkaround/entrypoint");

interface GoLiveSource {
    qualityOptions: QualityOptions;
    context: string;
    desktopSettings?: any;
    cameraSettings?: any;
}

interface QualityOptions {
    preset: number;
    resolution: number;
    frameRate: number;
}

export function ActionsWrapper() {
    return (
        <PanelButton className="streamQualityWorkaround-refresh" icon={ScreenIcon} tooltipText="Reset Stream Quality" onClick={() => FixStreamQuality()} />
    );
}

function GetExpectedScore(): number {
    let originalState = ApplicationStreamingSettingsStore.getState();
    return originalState.resolution * (originalState.resolution * (1 - (1 / 9)));
}

function GetMinimumRatio(): number {
    let value = moonlight.getConfigOption<number>("streamQualityWorkaround", "resolutionRatio");
    if (!value)
        return 0.5;

    return value / 100;
}

export function StreamStatsUpdate(e) {
    if (e.length > 1) {
        let videoStats = e[1];
        if (videoStats.bandwidthLimitedResolution) {
            logger.debug("Stream is lower quality, current Stream Stats: STATS: ", videoStats, "RESOLUTION: ", videoStats.resolution, "FPS: ", videoStats.frameRateInput);
            // Maybe should not count (0,0) as a valid score?
            let currentScore = videoStats.resolution.width * videoStats.resolution.height;
            let targetScore = GetExpectedScore();
            let ratio = currentScore / targetScore;
            logger.debug("Current Stream Ratio: ", ratio);
            if (ratio < GetMinimumRatio()) {
                logger.info("Stream fix is needed, Current Score: ", currentScore, " Target Score: ", targetScore, " Ratio: ", ratio);
                FixStreamQuality();
            }
        }
    }
}

// "Fixes" the stream being low quality on Linux by changing the source's framerate to something else, and then changing it back.
export default function FixStreamQuality() {
    let source = MediaEngineStore.getGoLiveSource();

    if (source) {
        let originalState = ApplicationStreamingSettingsStore.getState();
        let e: GoLiveSource = {
            qualityOptions: {
                preset: originalState.preset,
                resolution: originalState.resolution,
                frameRate: originalState.fps == 30 ? 15 : 30
            },
            context: "stream",
        };
        if (source.desktopSource) {
            e.desktopSettings = {
                sourceId: source.desktopSource.id,
                sound: originalState.soundshareEnabled
            };
        } else if (source.cameraSource) {
            e.cameraSettings = {
                videoDeviceGuid: source.cameraSource.videoDeviceGuid,
                audioDeviceGuid: source.cameraSource.audioDeviceGuid
            };
        }
        logger.info("Commencing stream fix: ", e, source, originalState);
        AudioActionCreators.setGoLiveSource(e);
        e.qualityOptions.frameRate = originalState.fps;
        AudioActionCreators.setGoLiveSource(e);
    }
}