import { resolve } from "node:path";
import isSvg from 'is-svg';
import mime from "mime-types";
import fs from "node:fs";

const logger = moonlightNode.getLogger("customChatButtons/node");

export function getImageData(file: string) {
	let path = resolve(file);
	if (!fs.existsSync(path)) {
		return { data: null, isSvg: false };
	}

	try {
		let type = mime.lookup(path);
		let typeIsSvg = type == "image/svg+xml";
		let data = fs.readFileSync(path, typeIsSvg ? "utf-8" : undefined);

		if (!data)
			return null;

		if (typeIsSvg || (typeof(data) === "string" && isSvg(data, { validate: false }))) {
			return { data: data, isSvg: true };
		} else {
			return { data: `data:${type};base64,${data.toString('base64')}`, isSvg: false };
		}
	} catch (e) {
		logger.error(e);
	}
}