// Largely taken from https://github.com/Vendicated/Vencord/blob/main/src/utils/dependencies.tsx

import { applyPalette, GIFEncoder, quantize } from "gifenc";
const { parseURL } = require("./apng-canvas").APNG as { parseURL(url: string): Promise<ApngFrameData>; };

// https://wiki.mozilla.org/APNG_Specification#.60fcTL.60:_The_Frame_Control_Chunk
const enum ApngDisposeOp {
    /**
     * no disposal is done on this frame before rendering the next; the contents of the output buffer are left as is.
     */
    NONE,
    /**
     * the frame's region of the output buffer is to be cleared to fully transparent black before rendering the next frame.
     */
    BACKGROUND,
    /**
     * the frame's region of the output buffer is to be reverted to the previous contents before rendering the next frame.
     */
    PREVIOUS
}
const enum ApngBlendOp {
    SOURCE,
    OVER
}
interface ApngFrame {
    left: number;
    top: number;
    width: number;
    height: number;
    img: HTMLImageElement;
    delay: number;
    blendOp: ApngBlendOp;
    disposeOp: ApngDisposeOp;
}

interface ApngFrameData {
    width: number;
    height: number;
    frames: ApngFrame[];
    playTime: number;
}

module.exports = getAnimatedStickerAsGif;

async function getAnimatedStickerAsGif(stickerLink: string, stickerId: string, stickerSize: number) {
    const { frames, width, height } = await parseURL(stickerLink);

    const gif = GIFEncoder();
    const resolution = stickerSize;

    const canvas = document.createElement("canvas");
    canvas.width = resolution;
    canvas.height = resolution;

    const ctx = canvas.getContext("2d", {
        willReadFrequently: true
    })!;

    const scale = resolution / Math.max(width, height);
    ctx.scale(scale, scale);

    let previousFrameData: ImageData;

    for (const frame of frames) {
        const { left, top, width, height, img, delay, blendOp, disposeOp } = frame;

        previousFrameData = ctx.getImageData(left, top, width, height);

        if (blendOp === ApngBlendOp.SOURCE) {
            ctx.clearRect(left, top, width, height);
        }

        ctx.drawImage(img, left, top, width, height);

        const { data } = ctx.getImageData(0, 0, resolution, resolution);

        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);

        gif.writeFrame(index, resolution, resolution, {
            transparent: true,
            palette,
            delay
        });

        if (disposeOp === ApngDisposeOp.BACKGROUND) {
            ctx.clearRect(left, top, width, height);
        } else if (disposeOp === ApngDisposeOp.PREVIOUS) {
            ctx.putImageData(previousFrameData, left, top);
        }
    }

    gif.finish();

    const file = new File([gif.bytesView()], `${stickerId}.gif`, { type: "image/gif" });
    return file;
}