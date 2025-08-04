import ChatButtonList from "@moonlight-mod/wp/componentEditor_chatButtonList";
import { NodeEventType } from "@moonlight-mod/types/core/event";

function UpdateRemovedButtons() {
    let options = moonlight.getConfigOption<string[]>("cleanChatBar", "removedButtons");
    for (const option of options!) {
        ChatButtonList.removeButton(option);
    }
}   

moonlightNode.events.addEventListener(NodeEventType.ConfigSaved, UpdateRemovedButtons);
UpdateRemovedButtons();