/**
 * Keep me middleware friendly
 *
 * Megaparam pattern for the chart parameters
 *
 * Allow to statically render some charts
 *
 * https://blog.vulcanjs.org/render-anything-statically-with-next-js-and-the-megaparam-4039e66ffde
 */

import { ChartParams, chartParamsSchema } from './typings'

export function chartParamsFromSearch(sp: URLSearchParams | any): ChartParams {
    if (!(sp instanceof URLSearchParams)) {
        sp = new URLSearchParams(sp)
    }
    const maybeChartParams = {
        localeId: sp.get('localeId'),
        surveyId: sp.get('surveyId'),
        editionId: sp.get('editionId'),
        sectionId: sp.get('sectionId'),
        blockId: sp.get('blockId')
    }
    const parsed = chartParamsSchema.safeParse(maybeChartParams)
    if (parsed.success) {
        return parsed.data as ChartParams
    } else {
        // @ts-ignore
        console.error('Invalid chart params', parsed.error)
        return null
    }
}
