import { resolve } from "node:path";
import isSvg from 'is-svg';
import mime from "mime-types";
import fs from "node:fs";

const logger = moonlightNode.getLogger("customChatButtons/node");

export function getImageData(file: string) {
	let path = resolve(file);
	
	try {
		let type, typeIsSvg, data;

		if (!fs.existsSync(path)) {
			// Assume a raw SVG/dataurl is being used
			if (file.startsWith("data:"))
				return { data: file, isSvg: false };

			if (!isSvg(file, { validate: false }))
				return { data: null, isSvg: false };

			typeIsSvg = true;
			data = file;
		} else {
			type = mime.lookup(path);
			typeIsSvg = type == "image/svg+xml" || (typeof (data) === "string" && isSvg(data, { validate: false }));
			data = fs.readFileSync(path, typeIsSvg ? "utf-8" : undefined);
		}

		if (!data)
			return null;

		if (typeIsSvg) {
			return { data: data, isSvg: true };
		} else {
			return { data: `data:${type};base64,${data.toString('base64')}`, isSvg: false };
		}
	} catch (e) {
		logger.error(e);
	}
}