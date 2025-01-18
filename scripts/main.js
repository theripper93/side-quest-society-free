import {initConfig} from "./config.js";
import { registerSettings } from "./settings.js";

export const MODULE_ID = "side-quest-society-free";

Hooks.on("init", () => {
    initConfig();
    registerSettings();
});