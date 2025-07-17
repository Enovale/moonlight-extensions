import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";
import React from "@moonlight-mod/wp/react";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";

const InboxComponent = spacepack.findByCode(`.getUnseenInviteCount${""}()>0)`)?.[0]?.exports.Z;
const BugReportComponent = spacepack.findByCode('navId:"staff-help-popout"')?.[0]?.exports.Z;

export function addIconToToolBar(e: { toolbar: React.ReactNode[] | React.ReactNode; }) {
    if (Array.isArray(e.toolbar))
        return e.toolbar.unshift(
            getIcons()
        );

    e.toolbar = [
        getIcons(),
        e.toolbar,
    ];
}

export function getIcons() {
    return moonlight.getConfigOption<boolean>("removeTopBar", "moveButtons") ? (
        <ErrorBoundary noop={true} key={"RemoveTopBar"}>
            <InboxComponent />
            <BugReportComponent />
        </ErrorBoundary>
    ) : null;
}