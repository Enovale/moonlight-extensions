import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import { MediaEngineStore, ApplicationStreamingSettingsStore } from "@moonlight-mod/wp/common_stores";

export const AudioActionCreators = spacepack.findByCode("AudioActionCreators")[0].exports.Z;

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

// "Fixes" the stream being low quality on Linux by changing the source's framerate to something else, and then changing it back.
export default function FixStreamQuality() {
    let source = MediaEngineStore.getGoLiveSource();
    console.log(source);

    if (source) {
        let originalState = ApplicationStreamingSettingsStore.getState();
        console.log(originalState);
        let e: GoLiveSource = {
            qualityOptions: {
                preset: originalState.preset,
                resolution: originalState.resolution,
                frameRate: originalState.fps
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
        console.log(e);
        let changed = e;
        changed.qualityOptions.frameRate = originalState.fps == 30 ? 15 : 30;
        AudioActionCreators.setGoLiveSource(changed);
        AudioActionCreators.setGoLiveSource(e);
    }
}

window.fixStreamQuality = FixStreamQuality;