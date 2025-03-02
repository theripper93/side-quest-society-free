import { SQSBrowser } from "./app/SQSBrowser.js";
import { CallingCard } from "./callingCard.js";
import { initConfig } from "./config.js";
import { getSetting, registerSettings, setSetting } from "./settings.js";
import { Socket } from "./lib/socket.js";
import { showWelcome } from "./lib/welcome.js";

export const MODULE_ID = "side-quest-society-free";

Hooks.on("init", () => {
    registerSettings();
    initConfig();
    ui.SQSBrowser = SQSBrowser;
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
    showWelcome(`<p>The side quest society (SQS) is a collection of adventures that can be played stand alone or by using the SQS headquarters. You can open the SQS Adventure Browser any time from the module settings!</p>
            <p>Once you have completed an adventure, use the SQS Adventure Browser to vote which ending your group has chosen. This will help shape future adventures!</p>`, () => {
        ui.notifications.info("You can open the SQS Adventure Browser any time from the module settings!", {permanent: true});
        new SQSBrowser().render(true)
    });
});
