import { MODULE_ID } from "../main.js";
import { HandlebarsApplication, mergeClone } from "../lib/utils.js";
import {getSetting, setSetting} from "../settings.js";

let questServerData = null;

export class SQSBrowser extends HandlebarsApplication {
    constructor() {
        super();
    }

    static get DEFAULT_OPTIONS() {
        return mergeClone(super.DEFAULT_OPTIONS, {
            classes: [this.APP_ID],
            window: {
                title: `${MODULE_ID}.${this.APP_ID}.title`,
                icon: '<i class="fas fa-scroll"></i>',
                resizable: true,
            },
            position: {
                width: window.innerWidth * 0.6,
                height: window.innerHeight * 0.8,
            },
        });
    }

    static get PARTS() {
        return {
            content: {
                template: `modules/${MODULE_ID}/templates/${this.APP_ID}.hbs`,
                classes: ["standard-form"],
                scrollable: [".scrollable"],
            },
        };
    }

    async _prepareContext(options) {
        if (!questServerData) {
            questServerData = await this.#getQuestServerData();
        }
        const data = {};
        const freeQuests = await game.packs.get("side-quest-society-free.sqs-free-adventures").getDocuments();
        const premiumQuests = await game.packs.get("side-quest-society-premium.sqs-premium-adventures").getDocuments();
        const currentVotes = getSetting("votes");
        data.quests = freeQuests.concat(premiumQuests).sort((a, b) => a.name.localeCompare(b.name));
        data.quests.forEach(quest => {
            const questId = quest.name.slugify({strict: true});
            const serverData = questServerData[questId] ?? {};
            const votes1 = serverData.one ?? 0;
            const votes2 = serverData.two ?? 0;
            const totalVotes = votes1 + votes2;
            const percentage = Math.round((votes1 / totalVotes) * 100);
            quest.votes1prc = percentage;
            quest.votes2prc = 100 - percentage;
            quest.votes1 = votes1;
            quest.votes2 = votes2;
            const voted1 = currentVotes[questId] === "one";
            const voted2 = currentVotes[questId] === "two";
            quest.voted1 = voted1;
            quest.voted2 = voted2;
            quest.canVote = !serverData.closed;
        });
        return { ...data };
    }

    _onRender(context, options) {
        super._onRender(context, options);
        const html = this.element;
        html.querySelectorAll("button").forEach(button => {
            button.addEventListener("click", this.#onButtonClick.bind(this));
        });
    }

    async #onButtonClick(event) {
        const uuid = event.currentTarget.closest("li").dataset.uuid;
        const document = await fromUuid(uuid);
        if (event.currentTarget.id === "import") return document.sheet.render(true);
        if (event.currentTarget.id === "vote-one") return this.#vote(document, "one");
        if (event.currentTarget.id === "vote-two") return this.#vote(document, "two");
    }

    async #getQuestServerData() {
        const res = await fetch("https://theripper93.com/api/sqs");
        const resJson = await res.json();
        if (resJson.error) return ui.notifications.error(resJson.error);
        return resJson.data.reduce((acc, val) => {
            acc[val.questId] = {one: val.one, two: val.two};
            return acc;
        }, {});
    }

    async #vote(document, vote) {
        const questId = document.name.slugify({strict: true});
        const currentVote = getSetting("votes")[questId];
        if(currentVote === vote) return;
        const newVote = !currentVote;
        const requestData = {
            questId,
            vote,
            switchVote: !newVote,
        };

        //Post to server
        const res = await fetch("https://theripper93.com/api/sqs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        })
        console.log(await res.json());
        if (res.status !== 200) return ui.notifications.error(res.statusText);
        const currentSetting = getSetting("votes");
        currentSetting[questId] = vote;
        setSetting("votes", currentSetting);

        const cached = questServerData[questId];
        if (cached) {
            cached[vote] += 1;
            const other = vote === "one" ? "two" : "one";
            if(!newVote) cached[other] -= 1;
        }

        this.render();
    }

    _onClose(options) {
        super._onClose(options);
    }
}
