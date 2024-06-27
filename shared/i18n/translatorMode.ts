import { getI18nElementAttr, getI18nElements } from "./attributes";

export function enableTranslatorMode() {
    console.debug(
        "Enabling translator mode.",
        "A token may not be found for following reasons:",
        "1. It doesn't exist in the 'locale' github folder",
        "Fix: create the token",
        "2. The app didn't load the relevant translation context (general etc.)",
        "Fix: when loading locales from API, include missing context",
        "3. The API didn't return it",
        "That's a bug in the API, need investigation",
        "4. The token was retrieved server-side but not sent to the browser",
        "Properly setup the client tokens provided to the filtering logic",
    )
    // we expect T components to use data attributes that allow this script to detect them
    getI18nElements().forEach(
        (el) => {
            // console.debug("Found a translated element", el);
            const { token, missing } = getI18nElementAttr(el)
            // Turn the translation token into an input
            //const input = document.createElement("input");
            const translationElem = document.createElement(el.tagName)
            translationElem.style.border = "solid 1px blue"
            translationElem.textContent = `${token || "EMPTY TOKEN KEY"}|${el.textContent || "EMPTY TRANSLATION"}`
            if (missing) {
                translationElem.textContent += "|TOKEN NOT FOUND"
            }
            el.replaceWith(translationElem);
        });
}