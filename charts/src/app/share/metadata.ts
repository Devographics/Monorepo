import { getBlockMeta } from '@/block/metadata'
import { fetchEditionSitemap, fetchAllLocalesIds } from '@devographics/fetch'
import { getLocaleDict } from '@devographics/i18n/server'
import { ChartParams } from './typings'
import { getBlock } from '@/lib/helpers'
import { getStringTranslator } from '@/lib/i18n'

/*

Example link:

https://share.stateofcss.com/share/prerendered?localeId=en-US&surveyId=state_of_css&editionId=css2023&blockId=subgrid&params=&sectionId=features&subSectionId=layout

*/
export async function getBlockMetaFromParams(chartParams: ChartParams) {
    const {
        surveyId,
        editionId,
        sectionId,
        subSectionId,
        blockId,
        localeId: localeId_,
        params
    } = chartParams

    // const { data: edition, error } = await fetchEditionMetadata({
    //     surveyId: chartParams.survey,
    //     editionId: chartParams.edition,
    //     calledFrom: 'charts'
    // })
    const { data: edition, error } = await fetchEditionSitemap({
        surveyId,
        editionId,
        calledFrom: 'charts'
    })

    const { sitemap } = edition

    if (!sitemap) {
        throw new Error(`getBlockMetaFromParams: no sitemap found for edition ${editionId}`)
    }

    if (error) {
        throw new Error(
            `Error while fetching edition metadata (survey: ${surveyId}, edition: ${editionId}): ${error.toString()}`
        )
    }
    // i18n
    // TODO: might need to be reused elsewhere
    // see survey form for a RSC version of this call (here we don't need request-level caching)

    const blockDefinition = getBlock({ blockId, sectionId, subSectionId, sitemap })

    const { data: possibleLocales, error: possibleLocalesError } = await fetchAllLocalesIds({
        calledFrom: 'charts'
    })
    if (possibleLocalesError) {
        throw new Error(
            `Cannot list possible locales (${JSON.stringify(
                chartParams
            )}). Error: ${possibleLocalesError}`
        )
    }
    let localeId = localeId_
    if (!possibleLocales.includes(localeId)) {
        console.warn(`Locale ${localeId} unknown, fallback to en-US for block metadata`)
        localeId = 'en-US'
    }
    const result = await getLocaleDict({
        localeId,
        // TODO: define contexts as part of edition config?
        contexts: ['common', 'results', 'countries', surveyId, editionId]
    })
    const { locale, error: localeError } = result
    if (localeError || !locale) {
        console.log(localeError)
        throw new Error(`Could not get locales strings (${JSON.stringify(chartParams)})`)
    }
    const { strings, ...localeWithoutStrings } = locale
    console.log('Got locale with string for block metadata', localeWithoutStrings)

    const getString = getStringTranslator(locale)

    const blockMeta = getBlockMeta({
        block: blockDefinition,
        blockParameters: params && JSON.parse(params),
        pageContext: {
            survey: edition.survey,
            localeId,
            edition,
            sectionId,
            subSectionId
        },
        // TODO: do an actual translation, we can take the surveyform as inspiration
        // for loading and translating locales in the backend
        // TODO: check in surveyform what logic we use to get the string
        getString
    })
    return { blockDefinition, blockMeta }
}
