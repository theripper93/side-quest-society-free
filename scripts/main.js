import { SQSBrowser } from "./app/SQSBrowser.js";
import { CallingCard } from "./callingCard.js";
import { initConfig } from "./config.js";
import { registerSettings } from "./settings.js";
import { Socket } from "./lib/socket.js";

export const MODULE_ID = "side-quest-society-free";

Hooks.on("init", () => {
    registerSettings();
    initConfig();
    Socket.register("showCallingCard", async (data) => {
        new CallingCard(data.message, data.options);
    });

    CONFIG.TextEditor.enrichers.push({
        id: MODULE_ID,
        pattern: /@sqs-card\[(.*?)\]/g,
        enricher: (match) => {
            const data = match[1];
            const [text, large] = data.split("|");
            const a = document.createElement("a");
            a.classList.add("content-link");
            a.classList.add("sqs-card-content-link");
            a.dataset.text = text;
            a.dataset.large = large ?? true;
            a.innerHTML = `<i class="fas fa-credit-card-blank"></i>Calling Card`;
            return a;
        },
    });

    document.addEventListener("click", (event) => {
        console.log("Click")
        if (event.target.classList.contains("sqs-card-content-link")) {
            const data = event.target.dataset;
            const message = data.text;
            const options = {
                large: data.large === "true",
                render: true,
            };
            new CallingCard(message, options);
        }
    });
});

Hooks.on("ready", () => {
    //new SQSBrowser().render(true);
    //new CallingCard("A hidden path awaits those who seek adventure beyond fate. Aid is needed where kings cannot tread. If you dare, meet at The Gilded Lantern by midnight.")
    window.CallingCard = CallingCard;
});
