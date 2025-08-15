import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";
import React, { useEffect, useState } from "@moonlight-mod/wp/react";

import meowSvg from "../assets/meow.svg";
import woofSvg from "../assets/woof.svg";

const SpriteStyles = spacepack.findByCode(",spriteContainer:")[0].exports;

const natives = moonlight.getNatives("customChatButtons");

interface SpriteDataDefinition {
    data: string | React.ReactNode | React.ReactNode[] | undefined,
    isSvg: boolean
}

interface BuiltinSpriteMap {
    [key: string]: string | undefined
}

export const builtinSprites: BuiltinSpriteMap = {
    meow: meowSvg,
    woof: woofSvg,
};

const cachedImages: { [id: string]: SpriteDataDefinition; } = {};

export function SvgFromData({ path }: { path: string | undefined }) {
    if (!path)
        return null;

    const [spriteData, setSpriteData] = useState<SpriteDataDefinition>();

    useEffect(() => {
        if (path in cachedImages) {
            setSpriteData(cachedImages[path]);
        } else if (path in builtinSprites) {
            cachedImages[path] = { data: natives.parseSvg(builtinSprites[path] as string), isSvg: true };
            console.log(cachedImages[path]);
            setSpriteData(cachedImages[path]);
        }

        natives.getImageData(path, setSpriteData);
    }, []);

    return (
        <ErrorBoundary noop={true}>
            <div className={`${SpriteStyles.spriteContainer} customChatButtons-colored-svg`}>
                {spriteData && spriteData.isSvg && spriteData.data}
                {spriteData && !spriteData.isSvg && spriteData.data && <img className="customChatButtons-colored-svg" src={spriteData.data as string} />}
            </div>
        </ErrorBoundary>
    )
}