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
import { ButtonEntry } from "@moonlight-mod/wp/customChatButtons_settings";
import { SvgFromData } from "@moonlight-mod/wp/customChatButtons_svgdata";

const extensionKey = "customChatButtons";
const selectedButtonKey = extensionKey + "_selectedButton";

const ChatBarButton = spacepack.findByCode("CHAT_INPUT_BUTTON_NOTIFICATION,width")[0].exports.Z;
const ButtonStyles = spacepack.findByCode(",expressionPickerPositionLayer:")[0].exports;
const { sendMessage } = spacepack.require("discord/actions/MessageActionCreators").default;
const getNonce = Object.values(spacepack.findByCode(".fromTimestampWithSequence")[0].exports)[0];

function getStorageSelectedButton(index: number) {
    let ret = moonlight.localStorage.getItem(selectedButtonKey + index.toString());
    if (!ret)
        moonlight.localStorage.setItem(selectedButtonKey + index.toString(), "0");

    return Number(ret ?? "0");
}

function setStorageSelectedButton(btnIndex: number, value: number) {
    moonlight.localStorage.setItem(selectedButtonKey + btnIndex.toString(), value.toString());
}

function chatButton() {
    let buttons = moonlight.getConfigOption<ButtonEntry[]>(extensionKey, "buttonList") ?? [];
    let customButtonCount = moonlight.getConfigOption<number>("customChatButtons", "customButtonCount") ?? 1;
    let customButtons: React.ReactNode[] = [];

    for (let i = 0; i < customButtonCount; i++) {
        const [buttonIdx, setButtonIdx] = useState(getStorageSelectedButton(i));

        function setButtonIndex(index: number) {
            let previousIndex = buttonIdx;
            if (buttonIdx >= buttons.length)
                index = buttons.length - 1;

            setStorageSelectedButton(i, index);
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
            sendMessage(channel.id, { content: button.message }, void 0, { nonce: getNonce() });
        }

        let button = getButton(buttonIdx);
        if (!button)
            return undefined;

        customButtons.push(
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
        );
    }

    return customButtons;
}

ChatButtonList.addButton(extensionKey, chatButton, "gif", true);