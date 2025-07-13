import { greeting } from "@moonlight-mod/wp/customChatButtons_someLibrary";

const logger = moonlight.getLogger("customChatButtons/entrypoint");
logger.info("Hello from entrypoint!");
logger.info("someLibrary exports:", greeting);

const natives = moonlight.getNatives("customChatButtons");
logger.info("node exports:", natives);
