import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import { MediaEngineStore, ApplicationStreamingSettingsStore } from "@moonlight-mod/wp/common_stores";

export const AudioActionCreators = spacepack.findByCode("AudioActionCreators")[0].exports.Z;

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
            logger.info("Current Stream Ratio: ", ratio);
            if (ratio < GetMinimumRatio())
                FixStreamQuality();
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

window.fixStreamQuality = FixStreamQuality;