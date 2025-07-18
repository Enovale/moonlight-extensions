import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";
import React from "@moonlight-mod/wp/react";

let buttons: Array<React.ReactNode> | undefined;

export function getIcons() {
  return moonlight.getConfigOption<boolean>("removeTopBar", "moveButtons") && buttons != null ? (
    <ErrorBoundary noop={true} key={"RemoveTopBar"}>
      {buttons}
    </ErrorBoundary>
  ) : null;
}

export function storeButtons(incoming: Array<React.ReactNode>) {
  buttons = incoming;
}
