import ChatButtonList from "@moonlight-mod/wp/componentEditor_chatButtonList";
//import { ChatButtonListAnchors } from "@moonlight-mod/types/coreExtensions/componentEditor";
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

const extensionKey = "customChatButtons";
const selectedButtonKey = extensionKey + "_selectedButton";

const ChatBarButton = spacepack.findByCode("CHAT_INPUT_BUTTON_NOTIFICATION,width")[0].exports.Z;
const SpriteStyles = spacepack.findByCode(",spriteContainer:")[0].exports;
const ButtonStyles = spacepack.findByCode(",expressionPickerPositionLayer:")[0].exports;
const { sendMessage } = spacepack.require("discord/actions/MessageActionCreators").default;

const natives = moonlight.getNatives("customChatButtons");

export const builtinSprites = {
    meow: `<svg width="20" height="20" viewBox="0 0 576 512"><path fill="currentColor" d="M320 192h17.1c22.1 38.3 63.5 64 110.9 64 11 0 21.8-1.4 32-4v228c0 17.7-14.3 32-32 32s-32-14.3-32-32V339.2L280 448h56c17.7 0 32 14.3 32 32s-14.3 32-32 32H192c-53 0-96-43-96-96V192.5c0-16.1-12-29.8-28-31.8l-7.9-1c-17.5-2.2-30-18.2-27.8-35.7S50.5 94 68 96.2l7.9 1c48 6 84.1 46.8 84.1 95.3v85.3c34.4-51.7 93.2-85.8 160-85.8m160 26.5c-10 3.5-20.8 5.5-32 5.5-28.4 0-54-12.4-71.6-32-3.7-4.1-7-8.5-9.9-13.2C357.3 164 352 146.6 352 128V10.7C352 4.8 356.7.1 362.6 0h.2c3.3 0 6.4 1.6 8.4 4.2v.1l12.8 17 27.2 36.3L416 64h64l4.8-6.4L512 21.3l12.8-17v-.1c2-2.6 5.1-4.2 8.4-4.2h.2c5.9.1 10.6 4.8 10.6 10.7V128c0 17.3-4.6 33.6-12.6 47.6-11.3 19.8-29.6 35.2-51.4 42.9M432 128a16 16 0 1 0-32 0 16 16 0 1 0 32 0m48 16a16 16 0 1 0 0-32 16 16 0 1 0 0 32"/></svg>`,
    woof: `<svg width="20" height="20" viewBox="0 0 576 512"><path fill="currentColor" d="m309.6 158.5 23.1-138.7C334.6 8.4 344.5 0 356.1 0c7.5 0 14.5 3.5 19 9.5L392 32h52.1c12.7 0 24.9 5.1 33.9 14.1L496 64h56c13.3 0 24 10.7 24 24v24c0 44.2-35.8 80-80 80h-69.3l-5.1 30.5zM416 256.1V480c0 17.7-14.3 32-32 32h-32c-17.7 0-32-14.3-32-32V364.8c-24 12.3-51.2 19.2-80 19.2s-56-6.9-80-19.2V480c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V249.8c-28.8-10.9-51.4-35.3-59.2-66.5L1 167.8c-4.3-17.1 6.1-34.5 23.3-38.8s34.5 6.1 38.8 23.3l3.9 15.5C70.5 182 83.3 192 98 192h205.8zM464 80a16 16 0 1 0-32 0 16 16 0 1 0 32 0"/></svg>`,
};

function ensureStorageInit() {
    if (!moonlight.localStorage.getItem(selectedButtonKey))
        moonlight.localStorage.setItem(selectedButtonKey, "0");
}

export function SvgFromData({ path }: {path: string | undefined}) {
    let data: string | undefined;
    switch (path) {
        case "meow":
        case "woof":
            data = builtinSprites[path];
            break;
    
        default:
            data = natives.getFileDataSync(path);
            if (!data)
                data = `<svg width="20" height="20" viewBox="0 0 576 512"><path fill="currentColor" d="${path}"/></svg>`;
            break;
    }
    return <div className={`${SpriteStyles.spriteContainer} customChatButtons-colored-svg`} dangerouslySetInnerHTML={{__html: data}} />
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
                    <MenuItem id={val.message} label={val.message} icon={SvgFromData({ path: val.svg })} action={() => { setButtonIndex(i); }} />
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
                        <div className={SpriteStyles.spriteContainer}>
                            <SvgFromData path={button?.svg} />
                        </div>
                    </ChatBarButton>
                )}
            </Tooltip>
        </ErrorBoundary>
    )
}

ensureStorageInit();
ChatButtonList.addButton(extensionKey, chatButton, "gif", true);