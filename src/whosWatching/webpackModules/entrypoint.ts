import { greeting } from "@moonlight-mod/wp/whosWatching_someLibrary";

const logger = moonlight.getLogger("whosWatching/entrypoint");
logger.info("Hello from entrypoint!");
logger.info("someLibrary exports:", greeting);

const natives = moonlight.getNatives("whosWatching");
logger.info("node exports:", natives);
