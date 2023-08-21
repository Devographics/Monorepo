import { mkdirSync } from 'fs'
import path from 'path'
import { Sitemap } from './types'
import { capturePages } from './pages'
import { logger } from './logger'

/**
 * Run captures for each locale in parallel.
 */
export const captureLocales = async ({
    baseUrl,
    outputDir,
    sitemap,
    startFromLocale,
}: {
    baseUrl: string
    outputDir: string
    sitemap: Sitemap
    startFromLocale?: string
}) => {
    // if a locale is specified, restart process from that one
    const locales = getLocalesSubset(sitemap.locales, startFromLocale)

    logger.info(`${sitemap.contents.length} section(s) and ${locales.length} locale(s) to capture`)
    logger.info(`baseUrl: ${baseUrl} | outputDir: ${outputDir}`)

    // run everything at the same time
    // await Promise.all(
    //     sitemap.locales.map((locale) => {
    //         mkdirSync(path.join(outputDir, locale.id), { recursive: true })

    //         return capturePages({
    //             baseUrl,
    //             outputDir,
    //             pages: sitemap.contents,
    //             locale: locale.id,
    //         })
    //     })
    // )

    // run one by one
    for (const locale of locales) {
        mkdirSync(path.join(outputDir, locale.id), { recursive: true })

        await capturePages({
            baseUrl,
            outputDir,
            pages: sitemap.contents,
            locale: locale.id,
        })
    }

    logger.info(`done`)
}

const getLocalesSubset = (locales: { id: string }[], startFromLocale?: string) => {
    if (startFromLocale) {
        if (startFromLocale.slice(-1) === '+') {
            const localeId = startFromLocale.slice(0,-1)
            const localeIndex = locales.findIndex((l) => l.id === localeId)
            const subset = locales.slice(localeIndex)
            return subset
        } else {
            return locales.filter(l => l.id === startFromLocale)
        }
    } else {
        return locales
    }
}
