import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import React from "@moonlight-mod/wp/react";

import meowSvg from "../assets/meow.svg";
import woofSvg from "../assets/woof.svg";
import parse from 'html-react-parser';

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

    let data: string | React.ReactNode | React.ReactNode[] | undefined;
    let isSvg: boolean;

    if (path in cachedImages) {
        ({ data, isSvg } = cachedImages[path]);
    } else {
        if (path in builtinSprites)
            data = builtinSprites[path], isSvg = true;
        else
            ({ data, isSvg } = natives.getImageData(path));

        if (isSvg)
            data = parse(data as string, {
                replace(domNode: any) {
                    if (domNode.attribs && domNode.name === 'svg') {
                        domNode.attribs.className = "customChatButtons-colored-svg";
                        return domNode;
                    }
                }
            });

        cachedImages[path] = { data: data, isSvg: isSvg };
    }

    if (!data)
        return null;

    return (
        <div className={`${SpriteStyles.spriteContainer} customChatButtons-colored-svg`}>
            {isSvg && data}
            {!isSvg && <img className="customChatButtons-colored-svg" src={data as string} />}
        </div>
    )
}