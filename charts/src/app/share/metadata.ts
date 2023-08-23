import { getBlockMeta } from "@/block/metadata"
import { fetchAllLocalesIds, fetchEditionMetadata, fetchLocaleConverted } from "@devographics/fetch"
import { ChartParams } from "./typings"

export async function getBlockMetaFromParams(chartParams: ChartParams) {
    const { data: edition, error } = await fetchEditionMetadata({
        surveyId: chartParams.survey,
        editionId: chartParams.edition,
        calledFrom: "charts",
    })
    if (error)
        throw new Error(
            `Error while fetching edition metadata (survey: ${chartParams.survey}, edition: ${chartParams.edition
            }): ${error.toString()}`
        )
    // i18n
    // TODO: might need to be reused elsewhere
    // see survey form for a RSC version of this call (here we don't need request-level caching)
    const { data: possibleLocales, error: possibleLocalesError } = await fetchAllLocalesIds({ calledFrom: "charts" })
    if (possibleLocalesError) {
        throw new Error(`Cannot list possible locales (${JSON.stringify(chartParams)}). Error: ${possibleLocalesError}`)
    }
    let localeId = chartParams.lang
    if (!possibleLocales.includes(chartParams.lang)) {
        console.warn(`Locale ${chartParams.lang} unknown, fallback to en-US for block metadata`)
        localeId = "en-US"
    }
    const { data: locale, error: localeError } = await fetchLocaleConverted({
        localeId,
        // TODO: what are the relevant contexts here?
        contexts: []
    })
    if (localeError) {
        throw new Error(`Could not get locales strings (${JSON.stringify(chartParams)})`)
    }
    const { strings, ...localeWithoutStrings } = locale
    console.log("Got locale with string for block metadata", locale)

    const blockMeta = getBlockMeta({
        block: {
            id: chartParams.question,
            sectionId: chartParams.section,
            parameters: {}
        },
        edition,
        // TODO: do an actual translation, we can take the surveyform as inspiration
        // for loading and translating locales in the backend
        // TODO: check in surveyform what logic we use to get the string
        getString: key => ({ key, t: locale?.strings?.[key] || key, locale: localeWithoutStrings })
    })
    return blockMeta
}