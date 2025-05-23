import {SQSBrowser} from "./app/SQSBrowser.js";
import { MODULE_ID } from "./main.js";

const SETTING_CACHE = {};
const DEFAULT_CACHE = false;

export function registerSettings() {
    const settings = {
        devMode: {
            name: "Developer Mode",
            hint: "Enable developer mode",
            scope: "world",
            config: false,
            default: false,
            type: Boolean,
            requiresReload: true,
        },
        votes: {
            scope: "world",
            config: false,
            default: {},
            type: Object,
        },
        firstTime: {
            scope: "world",
            config: false,
            default: false,
            type: Boolean,
        },
        adventureCount: {
            scope: "world",
            config: false,
            default: 0,
            type: Number,
        }
    };

    registerSettingsArray(settings);

    game.settings.registerMenu(MODULE_ID, "sqsBrowser", {
        name: `${MODULE_ID}.${SQSBrowser.APP_ID}.title`,
        label: "Browse Adventures",
        icon: "fas fa-compass",
        type: SQSBrowser,
        restricted: true,
    });
}

export function getSetting(key) {
    return SETTING_CACHE[key] ?? game.settings.get(MODULE_ID, key);
}

export async function setSetting(key, value) {
    return await game.settings.set(MODULE_ID, key, value);
}

function registerSettingsArray(settings) {
    for (const [key, value] of Object.entries(settings)) {
        if (!value.name) value.name = `${MODULE_ID}.settings.${key}.name`;
        if (!value.hint) value.hint = `${MODULE_ID}.settings.${key}.hint`;
        if (value.useCache === undefined) value.useCache = DEFAULT_CACHE;
        if (value.useCache) {
            const unwrappedOnChange = value.onChange;
            if (value.onChange)
                value.onChange = (value) => {
                    SETTING_CACHE[key] = value;
                    if (unwrappedOnChange) unwrappedOnChange(value);
                };
        }
        game.settings.register(MODULE_ID, key, value);
        if (value.useCache) SETTING_CACHE[key] = getSetting(key);
    }
}
