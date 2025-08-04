import { Message } from "@moonlight-mod/types";
import ChatButtonList from "@moonlight-mod/wp/componentEditor_chatButtonList";
import { Tooltip } from "@moonlight-mod/wp/discord/components/common/index";
import { SelectedChannelStore, ChannelStore } from "@moonlight-mod/wp/common_stores";
import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import React from "@moonlight-mod/wp/react";

const ChatBarButton = spacepack.findByCode("CHAT_INPUT_BUTTON_NOTIFICATION,width")[0].exports.Z;
const Styles = spacepack.findByCode(",spriteContainer:")[0].exports;
const { sendMessage } = spacepack.require("discord/actions/MessageActionCreators").default

function onClick() {
    let channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
    sendMessage(channel.id, { content: "meow" });
}

function chatButton() {
    return (
        <ErrorBoundary>
            <Tooltip text="meow">
                {(tooltipProps: any) => (
                    <ChatBarButton {...tooltipProps} onClick={onClick}>
                        <div className={Styles.spriteContainer}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 576 512"><path fill="currentColor" d="M320 192h17.1c22.1 38.3 63.5 64 110.9 64c11 0 21.8-1.4 32-4v228c0 17.7-14.3 32-32 32s-32-14.3-32-32V339.2L280 448h56c17.7 0 32 14.3 32 32s-14.3 32-32 32H192c-53 0-96-43-96-96V192.5c0-16.1-12-29.8-28-31.8l-7.9-1c-17.5-2.2-30-18.2-27.8-35.7S50.5 94 68 96.2l7.9 1c48 6 84.1 46.8 84.1 95.3v85.3c34.4-51.7 93.2-85.8 160-85.8m160 26.5c-10 3.5-20.8 5.5-32 5.5c-28.4 0-54-12.4-71.6-32c-3.7-4.1-7-8.5-9.9-13.2C357.3 164 352 146.6 352 128V10.7C352 4.8 356.7.1 362.6 0h.2c3.3 0 6.4 1.6 8.4 4.2v.1l12.8 17l27.2 36.3L416 64h64l4.8-6.4L512 21.3l12.8-17v-.1c2-2.6 5.1-4.2 8.4-4.2h.2c5.9.1 10.6 4.8 10.6 10.7V128c0 17.3-4.6 33.6-12.6 47.6c-11.3 19.8-29.6 35.2-51.4 42.9M432 128a16 16 0 1 0-32 0a16 16 0 1 0 32 0m48 16a16 16 0 1 0 0-32a16 16 0 1 0 0 32" /></svg>
                        </div>
                    </ChatBarButton>
                )}
            </Tooltip>
        </ErrorBoundary>
    )
}

ChatButtonList.addButton("customChatButton", chatButton, "gif");