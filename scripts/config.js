import { MODULE_ID } from "./main.js";
import {getSetting} from "./settings.js";
import {FormBuilder} from "./lib/formBuilder.js";

export function initConfig() {

    if (getSetting("devMode")) {
        Hooks.on("getAdventureContextOptions", (compendium, folderContext) => {
            if (!compendium.collection.collection.includes("side-quest-society")) return;
            folderContext.push({
                name: "Edit SQS Metadata",
                icon: '<i class="fas fa-scroll"></i>',
                condition: true,
                callback: (li) => editMetadata(compendium.collection, li.dataset.entryId),
            });
        });
    }

}



async function editMetadata(compendium, id) {
    const document = await compendium.getDocument(id);
    const metadata = await new FormBuilder().object(document.flags[MODULE_ID]?.metadata ?? {})
        .title("Edit Side Quest Society Metadata:" + document.name)
        .text({name: "id", label: "ID", value: document.name.slugify({strict: true})})
        .number({name: "level.min", label: "Level Range MIN", value: 1})
        .number({name: "level.max", label: "Level Range MAX", value: 20})
        .text({name: "endingOne", label: "Ending 1", value: "The necromancer is defeated."})
        .text({name: "endingTwo", label: "Ending 2", value: "The necromancer escaped."})
        .render();
    if(metadata) return document.setFlag(MODULE_ID, "metadata", metadata);
}