import type { CustomComponentProps } from "@moonlight-mod/types/coreExtensions/moonbase";
import Moonbase from "@moonlight-mod/wp/moonbase_moonbase";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import MarkupUtils from "@moonlight-mod/wp/discord/modules/markup/MarkupUtils";
import React from "@moonlight-mod/wp/react";
import { builtinSprites } from "./entrypoint";

import {
    FormItem,
    FormText,
    Tooltip,
    Clickable
} from "@moonlight-mod/wp/discord/components/common/index";
import { Button } from "@moonlight-mod/wp/discord/uikit/legacy/Button";
import Flex from "@moonlight-mod/wp/discord/uikit/Flex";
import TextInput from "@moonlight-mod/wp/discord/uikit/TextInput";
import { CircleXIcon } from "@moonlight-mod/wp/discord/components/common/index";
import Margins from "@moonlight-mod/wp/discord/styles/shared/Margins.css";
import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";

import openSvgPickerModal from "./svgPickerModal";

export interface ButtonEntry {
    message: string,
    svg: string,
}

let GuildSettingsRoleEditClasses: any;
spacepack
    .lazyLoad(
        "renderArtisanalHack",
        /\[(?:.\.e\("\d+?"\),?)+\][^}]+?webpackId:\d+,name:"GuildSettings"/,
        /webpackId:(\d+),name:"GuildSettings"/
    )
    .then(
        () =>
        (GuildSettingsRoleEditClasses = spacepack.require(
            "discord/modules/guild_settings/roles/web/GuildSettingsRoleEdit.css"
        ))
    );

function markdownify(str: string) {
    return MarkupUtils.parse(str, true, {
        hideSimpleEmbedContent: true,
        allowLinks: true
    });
}

function RemoveEntryButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
    return (
        <div className={GuildSettingsRoleEditClasses.removeButtonContainer}>
            <Tooltip text="Remove entry" position="top">
                {(props: any) => (
                    <Clickable {...props} className={GuildSettingsRoleEditClasses.removeButton} onClick={onClick}>
                        <CircleXIcon width={16} height={16} />
                    </Clickable>
                )}
            </Tooltip>
        </div>
    );
}

export default function ButtonListSettings({ value = [], setValue }: CustomComponentProps): React.ReactNode {
    const entries: ButtonEntry[] = value ?? [];
    const updateConfig = () => setValue(entries);
    const displayName = "Chat Buttons";
    const description = "Test";
    const disabled = false;

    return (
        <ErrorBoundary>
            <FormItem className={Margins.marginTop20} title={displayName}>
                {description && <FormText className={Margins.marginBottom4}>{markdownify(description)}</FormText>}
                <Flex direction={Flex.Direction.VERTICAL} className="moonbase-settings-list customChatButtons-buttonList">
                    {entries.map((val, i) => {
                        function setEntryVal(e: ButtonEntry) {
                            entries[i] = e;
                            updateConfig();
                        }

                        return (
                            <div key={i} className="customChatButtons-buttonList-entry">
                                <TextInput
                                    value={val.message}
                                    disabled={disabled}
                                    onChange={(newVal: string) => {
                                        entries[i].message = newVal;
                                        updateConfig();
                                    }}
                                />
                                <Button
                                    size={Button.Sizes.MEDIUM}
                                    disabled={disabled}
                                    onClick={() => {
                                        openSvgPickerModal(entries[i], setEntryVal);
                                    }}>
                                    Select Icon
                                </Button>
                                <RemoveEntryButton
                                    disabled={disabled}
                                    onClick={() => {
                                        entries.splice(i, 1);
                                        updateConfig();
                                    }}
                                />
                            </div>
                        )
                    })}

                    <Button
                        look={Button.Looks.FILLED}
                        color={Button.Colors.GREEN}
                        size={Button.Sizes.SMALL}
                        disabled={disabled}
                        onClick={() => {
                            entries.push({ message: "", svg: "" });
                            updateConfig();
                        }}
                    >
                        Add new entry
                    </Button>
                </Flex>
            </FormItem>
        </ErrorBoundary>
    );
}

if (moonlight.getConfigOption("customChatButtons", "buttonList") === "default") {
    moonlight.setConfigOption("customChatButtons", "buttonList", [
        {
            message: "meow",
            svg: builtinSprites.meow
        },
        {
            message: "woof",
            svg: builtinSprites.woof
        }
    ])
}
Moonbase.registerConfigComponent("customChatButtons", "buttonList", ButtonListSettings)