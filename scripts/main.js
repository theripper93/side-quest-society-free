import {SQSBrowser} from "./app/SQSBrowser.js";
import {CallingCard} from "./callingCard.js";
import {initConfig} from "./config.js";
import { registerSettings } from "./settings.js";

export const MODULE_ID = "side-quest-society-free";

Hooks.on("init", () => {
    registerSettings();
    initConfig();

});

Hooks.on("ready", () => {
    //new SQSBrowser().render(true);
    //new CallingCard("A hidden path awaits those who seek adventure beyond fate. Aid is needed where kings cannot tread. If you dare, meet at The Gilded Lantern by midnight.")
    window.CallingCard = CallingCard;
});