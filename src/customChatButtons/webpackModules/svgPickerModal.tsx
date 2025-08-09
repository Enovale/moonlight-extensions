import React, { useState } from "@moonlight-mod/wp/react";
import {
    ModalRoot,
    ModalSize,
    ModalHeader,
    ModalCloseButton,
    ModalContent,
    Text,
    Tooltip,
    TextArea,
    FormItem
} from "@moonlight-mod/wp/discord/components/common/index";
import { SvgFromData, builtinSprites } from "./entrypoint";
import { Button } from "@moonlight-mod/wp/discord/uikit/legacy/Button";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import { openModal } from "@moonlight-mod/wp/discord/modules/modals/Modals";
import Flex from "@moonlight-mod/wp/discord/uikit/Flex";
import Margins from "@moonlight-mod/wp/discord/styles/shared/Margins.css";
import { ButtonEntry } from "./settings";
import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";

const ScrollbarStyles = spacepack.findByCode("scrollbarGhostHairline:")[0].exports;
const TextAreaStyles = spacepack.findByCode(',errorOverflow:', '"text-md/normal":')[0].exports;
const TextAreaWrapperStyles = spacepack.findByCode("helperTextContainer:")[0].exports;

export function SvgPickerModal({ entry, transitionState, onClose, setEntryVal }: { entry: ButtonEntry, transitionState: number | null, onClose: () => void, setEntryVal: (e: ButtonEntry) => void; }) {
    let [btnEntry, setBtnEntry] = useState(entry);

    function DefaultButton({ path }: { path: string }) {
        return (
            <Tooltip text={path}>
                {(tooltipProps: any) => (
                    <Button {...tooltipProps}
                        look={Button.Looks.FILLED}
                        color={Button.Colors.TRANSPARENT}
                        size={Button.Sizes.ICON}
                        onClick={() => {
                            setBtnEntry((v) => ({ ...v, svg: path }));
                        }}
                    >
                        <SvgFromData path={path} />
                    </Button>
                )}
            </Tooltip>
        );
    }

    return (
        <ModalRoot transitionState={transitionState} size={ModalSize.DYNAMIC} className="customChatButtons-svg-modal">
            <ErrorBoundary>
                <ModalHeader separator={false} className="customChatButtons-svg-modal-header">
                    <Text color="header-primary" variant="heading-lg/semibold" tag="h1" style={{ flexGrow: 1 }}>
                        Select Icon
                    </Text>
                    <ModalCloseButton onClick={() => onClose()} />
                </ModalHeader>

                <ModalContent className={`customChatButtons-svg-modal-content ${Margins.marginBottom20}`} scrollbarType="none">
                    <Flex direction={Flex.Direction.VERTICAL} className="moonbase-gap">
                        <FormItem title="Builtin Icons">
                            <Flex direction={Flex.Direction.HORIZONTAL} className="customChatButtons-svg-picker-modal-svg-list">
                                {Object.keys(builtinSprites).map((v) => (
                                    <DefaultButton path={v} />
                                ))}
                            </Flex>
                        </FormItem>
                        <FormItem title="File Path / SVG Data">
                            <div className={TextAreaWrapperStyles.wrapper}>
                                <TextArea
                                    className={`${TextAreaStyles.textArea} ${ScrollbarStyles.scrollbarDefault} moonbase-resizeable`}
                                    readOnly={false}
                                    value={btnEntry.svg}
                                    onChange={(event: any) => setBtnEntry((v) => ({ ...v, svg: event.target.value }))}
                                />
                            </div>
                        </FormItem>
                        <Button
                            look={Button.Looks.FILLED}
                            color={Button.Colors.GREEN}
                            size={Button.Sizes.SMALL}
                            onClick={() => {
                                onClose();
                                setEntryVal(btnEntry);
                            }}
                        >
                            Save
                        </Button>
                    </Flex>
                </ModalContent>
            </ErrorBoundary>
        </ModalRoot>
    );
}

export default function openSvgPickerModal(entry: ButtonEntry, setEntryVal: (e: ButtonEntry) => void) {
    openModal((props) => {
        return <SvgPickerModal entry={entry} setEntryVal={setEntryVal} {...props} />;
    });
}