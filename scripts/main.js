import {SQSBrowser} from "./app/SQSBrowser.js";
import {initConfig} from "./config.js";
import { registerSettings } from "./settings.js";

export const MODULE_ID = "side-quest-society-free";

Hooks.on("init", () => {
    registerSettings();
    initConfig();

});

Hooks.on("ready", () => {
    new SQSBrowser().render(true);
});