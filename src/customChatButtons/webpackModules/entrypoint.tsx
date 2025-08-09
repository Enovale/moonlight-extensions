import ChatButtonList from "@moonlight-mod/wp/componentEditor_chatButtonList";
import { Tooltip } from "@moonlight-mod/wp/discord/components/common/index";
import { SelectedChannelStore, ChannelStore } from "@moonlight-mod/wp/common_stores";
import { openContextMenu, closeContextMenu } from "@moonlight-mod/wp/discord/actions/ContextMenuActionCreators";
import { Menu } from "@moonlight-mod/wp/discord/components/common/index";
import { MenuItem } from "@moonlight-mod/wp/contextMenu_contextMenu";
import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import { useState } from "@moonlight-mod/wp/react";
import React from "@moonlight-mod/wp/react";
import { ButtonEntry } from "./settings";
import parse from 'html-react-parser';
import meowSvg from "../assets/meow.svg";
import woofSvg from "../assets/woof.svg";

const extensionKey = "customChatButtons";
const selectedButtonKey = extensionKey + "_selectedButton";

const ChatBarButton = spacepack.findByCode("CHAT_INPUT_BUTTON_NOTIFICATION,width")[0].exports.Z;
const SpriteStyles = spacepack.findByCode(",spriteContainer:")[0].exports;
const ButtonStyles = spacepack.findByCode(",expressionPickerPositionLayer:")[0].exports;
const { sendMessage } = spacepack.require("discord/actions/MessageActionCreators").default;

const natives = moonlight.getNatives("customChatButtons");

interface BuiltinSpriteMap {
    [key: string]: string | undefined
}

export const builtinSprites: BuiltinSpriteMap = {
    meow: meowSvg,
    woof: woofSvg,
};

function ensureStorageInit() {
    if (!moonlight.localStorage.getItem(selectedButtonKey))
        moonlight.localStorage.setItem(selectedButtonKey, "0");
}

export function SvgFromData({ path }: { path: string | undefined }) {
    if (!path)
        return null;

    let data: string | undefined;
    let isSvg: boolean;
    if (Object.keys(builtinSprites).includes(path))
        data = builtinSprites[path], isSvg = true;
    else
        ({ data, isSvg } = natives.getImageData(path));

    if (!data)
        return null;

    return (
        <div className={`${SpriteStyles.spriteContainer} customChatButtons-colored-svg`}>
            {isSvg && parse(data, {
                replace(domNode: any) {
                    if (domNode.attribs && domNode.name === 'svg') {
                        domNode.attribs.className = "customChatButtons-colored-svg";
                        return domNode;
                    }
                }
            })}
            {!isSvg && <img className="customChatButtons-colored-svg" src={data} />}
        </div>
    )
}

function chatButton() {
    let buttons = moonlight.getConfigOption<ButtonEntry[]>(extensionKey, "buttonList") ?? [];
    const [buttonIdx, setButtonIdx] = useState(Number(moonlight.localStorage.getItem(selectedButtonKey)!));

    function setButtonIndex(index: number) {
        let previousIndex = buttonIdx;
        if (buttonIdx >= buttons.length)
            index = buttons.length - 1;

        moonlight.localStorage.setItem(selectedButtonKey, String(index));
        setButtonIdx(index);

        if (moonlight.getConfigOption(extensionKey, "sendOnChange") && previousIndex != index) {
            if (buttons.length > 0)
                doSendMessage(buttons[index]);
        }
    }

    function getButton(idx: number) {
        if (buttons.length <= 0)
            return undefined;

        return buttons[idx];
    }

    function ButtonContextMenu() {
        let buttons = moonlight.getConfigOption<ButtonEntry[]>(extensionKey, "buttonList")!;

        return (
            <Menu navId={extensionKey + "_buttonList"} onClose={closeContextMenu} aria-label="Custom Chat Button Selector">
                {buttons.map((val, i) => (
                    <MenuItem id={val.message} label={val.message} icon={<SvgFromData path={val.svg} />} action={() => { setButtonIndex(i); }} />
                ))}
            </Menu>
        );
    }

    function onClick() {
        doSendMessage(getButton(buttonIdx));
    }

    function doSendMessage(button: ButtonEntry | undefined) {
        if (!button)
            return;

        let channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
        sendMessage(channel.id, { content: button.message });
    }

    let button = getButton(buttonIdx);
    if (!button)
        return undefined;

    return (
        <ErrorBoundary noop={true}>
            <Tooltip text={button?.message}>
                {(tooltipProps: any) => (
                    <ChatBarButton {...tooltipProps} className={ButtonStyles.button}
                        onClick={onClick}
                        onContextMenu={(e: React.SyntheticEvent) => {
                            e.preventDefault();
                            openContextMenu(e, () => <ButtonContextMenu />);
                        }}>
                        <SvgFromData path={button?.svg} />
                    </ChatBarButton>
                )}
            </Tooltip>
        </ErrorBoundary>
    )
}

ensureStorageInit();
ChatButtonList.addButton(extensionKey, chatButton, "gif", true);