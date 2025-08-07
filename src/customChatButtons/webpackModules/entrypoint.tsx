import ChatButtonList from "@moonlight-mod/wp/componentEditor_chatButtonList";
//import { ChatButtonListAnchors } from "@moonlight-mod/types/coreExtensions/componentEditor";
import { Tooltip } from "@moonlight-mod/wp/discord/components/common/index";
import { SelectedChannelStore, ChannelStore } from "@moonlight-mod/wp/common_stores";
import { openContextMenu, closeContextMenu } from "@moonlight-mod/wp/discord/actions/ContextMenuActionCreators";
import { Menu } from "@moonlight-mod/wp/discord/components/common/index";
import { MenuItem } from "@moonlight-mod/wp/contextMenu_contextMenu";
import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import { useState, useEffect } from "@moonlight-mod/wp/react";
import React from "@moonlight-mod/wp/react";
import { ButtonEntry } from "./settings";

const extensionKey = "customChatButtons";
const selectedButtonKey = extensionKey + "_selectedButton";

const ChatBarButton = spacepack.findByCode("CHAT_INPUT_BUTTON_NOTIFICATION,width")[0].exports.Z;
const SpriteStyles = spacepack.findByCode(",spriteContainer:")[0].exports;
const ButtonStyles = spacepack.findByCode(",expressionPickerPositionLayer:")[0].exports;
const { sendMessage } = spacepack.require("discord/actions/MessageActionCreators").default;

function ensureStorageInit() {
    if (!moonlight.localStorage.getItem(selectedButtonKey))
        moonlight.localStorage.setItem(selectedButtonKey, "0");
}

export function SvgFromData({ data }: { data: string | undefined }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 576 512"><path fill="currentColor" d={data} /></svg>
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
                    <MenuItem id={val.message} label={val.message} icon={SvgFromData({ data: val.svg })} action={() => { setButtonIndex(i); }} />
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
        <ErrorBoundary>
            <Tooltip text={button?.message}>
                {(tooltipProps: any) => (
                    <ChatBarButton {...tooltipProps} className={ButtonStyles.button}
                        onClick={onClick}
                        onContextMenu={(e: React.SyntheticEvent) => {
                            e.preventDefault();
                            openContextMenu(e, () => <ButtonContextMenu />);
                        }}>
                        <div className={SpriteStyles.spriteContainer}>
                            <SvgFromData data={button?.svg} />
                        </div>
                    </ChatBarButton>
                )}
            </Tooltip>
        </ErrorBoundary>
    )
}

ensureStorageInit();
ChatButtonList.addButton(extensionKey, chatButton, "gif", true);