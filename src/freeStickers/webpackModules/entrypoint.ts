// Heavily modified from https://github.com/uwx/moonlight-extensions/blob/master/src/freeMoji/

import { SelectedGuildStore, ChannelStore, PermissionStore } from "@moonlight-mod/wp/common_stores";
const StickerStore = spacepack.findByCode("StickerStore")[0].exports.Z;
const DraftType = spacepack.findByCode("ChannelMessage", "SlashCommand", "ThreadSettings", "FirstThreadMessage")[0].exports.d;
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";

const findStr = "=!0,showLargeMessageDialog:";
const UploadHandler = {
	promptToUpload: spacepack.findFunctionByStrings(spacepack.findByCode(findStr)[0].exports, findStr) as Function
}

const natives = moonlight.getNatives("freeStickers");

interface Message {
	content: string;
}

interface Attachments {
	stickerIds: string[] | undefined;
}

const extensions = ["json", "webp", "png", "apng", "gif", "jpeg", "jpg"];

function hasPermission(channelId: string, permission: bigint) {
	const channel = ChannelStore.getChannel(channelId);

	if (!channel || channel.isPrivate()) return true;

	return PermissionStore.can(permission, channel);
}

const hasAttachmentPerms = (channelId: string) => hasPermission(channelId, PermissionsBits.ATTACH_FILES);

const COOL = "Queueing message to be sent";
const module = spacepack.findByCode(COOL)[0].exports;

const originalSend = module.Z.sendMessage;
module.Z.sendMessage = async (...args: any[]) => {
	if (modifyIfNeeded(args[0], args[1], args[3]))
		return originalSend.call(module.Z, ...args);
};

function extractUnusableEmojis(channelId: string, stickerList: string[]) {
	const stickerUrls = [];

	for (var i = stickerList.length - 1; i >= 0; i--) {
		const stickerId = stickerList[i];

		// Fetch required info about the sticker
		const sticker = StickerStore.getStickerById(stickerId);

		// Check sticker usability
		if (sticker.guild_id != null && sticker.guild_id !== SelectedGuildStore.getGuildId()) {
			const format = extensions[sticker.format_type];

			// Remove sticker from sticker list
			stickerList.splice(i, 1);

			// Add stickers to to send
			const stickerSize = 160;
			const stickerLink = `https://media.discordapp.net/stickers/${sticker.id}.${format}?size=${stickerSize}`;

			if (sticker.format_type == 2 || sticker.format_type == 3) {
				sendAnimatedSticker(channelId, stickerLink, sticker.id, stickerSize);
			} else {
				stickerUrls.push(stickerLink);
			}
		}
	}
	return stickerUrls;
}

async function sendAnimatedSticker(channelId: string, stickerLink: string, stickerId: string, stickerSize: number) {
	const file = await natives(stickerLink, stickerId, stickerSize);
	UploadHandler.promptToUpload([file], ChannelStore.getChannel(channelId), DraftType.ChannelMessage);
}

export default function modifyIfNeeded(channelId: string, msg: Message, attachments: Attachments) {
	if (attachments.stickerIds == null || attachments.stickerIds.length <= 0) return true;

	// Find all emojis from the captured message string and return object with emojiURLS and content
	const extractedStickers = extractUnusableEmojis(channelId, attachments.stickerIds);

	if (attachments.stickerIds != null && attachments.stickerIds.length <= 0 && extractedStickers.length <= 0) return false;

	if (extractedStickers.length > 0) msg.content += `\n${extractedStickers.join("\n")}`;

	return true;
};