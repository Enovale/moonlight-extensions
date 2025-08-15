import { resolve } from "node:path";
import isSvg from 'is-svg';
import mime from "mime-types";
import parse from 'html-react-parser';
import fs from "node:fs/promises";
import { openAsBlob } from "node:fs";

const logger = moonlightNode.getLogger("customChatButtons/node");

interface SpriteDataDefinition {
	data: string | React.ReactNode | React.ReactNode[] | unknown | undefined,
	isSvg: boolean
}

export async function getImageData(file: string, setter: React.Dispatch<React.SetStateAction<SpriteDataDefinition | undefined>>) {
	let path = resolve(file);

	try {
		let type, typeIsSvg, data;

		try {
			await fs.access(path);
			type = mime.lookup(path);
			typeIsSvg = type == "image/svg+xml";
			if (typeIsSvg) {
				data = await fs.readFile(path, "utf-8");
			} else {
				let blob = await openAsBlob(path, { type: type });
				data = new File([await blob.arrayBuffer()], path, { type: type });
			}
		} catch { // Could not access file
			// Assume a raw SVG/dataurl is being used
			if (file.startsWith("data:"))
				return setter({ data: file, isSvg: false });
			else if (isStringUrl(file)) {
				let res = await fetch(file);
				if (res.status == 200) {
					type = res.headers.get("Content-Type");
					typeIsSvg = type == "image/svg+xml";
					if (typeIsSvg) {
						return setter({ data: parseSvg(await res.text()), isSvg: typeIsSvg });
					} else {
						return setter({ data: await convertBlobToBase64(await res.blob()), isSvg: typeIsSvg });
					}
				}
			} else if (!isSvg(file, { validate: false })) {
				return null;
			} else {
				typeIsSvg = true;
				data = file;
			}
		}

		if (!data)
			return null;

		if (typeIsSvg) {
			return setter({ data: parseSvg(data as string), isSvg: true });
		} else {
			return setter({ data: await convertBlobToBase64(data as Blob | File), isSvg: false });
		}
	} catch (e) {
		logger.error(e);
	}
}

// Annoyingly, doesn't actually support any kind of blob. FileReader will complain it its a subclass
export function convertBlobToBase64(blob: Blob | File) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader;
		reader.onerror = reject;
		reader.onload = () => {
			resolve(reader.result);
		};
		reader.readAsDataURL(blob);
	});
};

export function parseSvg(src: string) {
	return parse(src, {
		replace(domNode: any) {
			if (domNode.attribs && domNode.name === 'svg') {
				domNode.attribs.className = "customChatButtons-colored-svg";
				return domNode;
			}
		}
	});
}

function isStringUrl(urlStr: string) {
	let url;
	try {
		url = new URL(urlStr);
	} catch (_) {
		return false;
	}

	return url.protocol === "http:" || url.protocol === "https:";
}