/** 
 * Token key for a given translated text
 * used to enable translation mode
 */
export const TOKEN_DATASET = "dgTk"
/** Data attribute containing the translation token for a given piece of text */
export const DATA_TOKEN_ATTR = "data-dg-tk"
/** If enabled, a fallback string was used */
export const DATA_MISSING_ATTR = "data-dg-missing"
/** Get translation spans */
export const I18N_TOKEN_SELECTOR = `[${DATA_TOKEN_ATTR}]`

export function getI18nElements() {
    const elems: Array<HTMLElement> = []
    document.querySelectorAll(I18N_TOKEN_SELECTOR).forEach((el) => {
        if (!(el instanceof HTMLElement)) {
            console.warn(
                "Found a translation element which is not an HTMLElement",
                el,
            );
            return false
        }
        elems.push(el)
    })
    return elems
}
export function getI18nElementAttr(el: HTMLElement) {
    return {
        token: el.dataset?.["dgTk"],
        missing: el.dataset?.["dgMissing"]
    }
}