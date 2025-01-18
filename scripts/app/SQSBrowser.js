import { MODULE_ID } from "../main.js";
import { HandlebarsApplication, mergeClone } from "../lib/utils.js";

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
                width: window.innerWidth * 0.7,
                height: window.innerHeight * 0.7,
            },
        });
    }

    static get PARTS() {
        return {
            content: {
                template: `modules/${MODULE_ID}/templates/${this.APP_ID}.hbs`,
                classes: ["standard-form"],
                scrollable: [],
            },
        };
    }

    async _prepareContext(options) {
        const data = {};
        const freeQuests = await game.packs.get("side-quest-society-free.sqs-free-adventures").getDocuments();
        const premiumQuests = await game.packs.get("side-quest-society-premium.sqs-premium-adventures").getDocuments();
        data.quests = freeQuests.concat(premiumQuests).sort((a, b) => a.name.localeCompare(b.name));
        data.quests.forEach(quest => {
            quest.votes1 = Math.random() * 100;
        });
        console.log(data.quests);
        return { ...data };
    }

    _onRender(context, options) {
        super._onRender(context, options);
        const html = this.element;
    }

    _onClose(options) {
        super._onClose(options);
    }
}
