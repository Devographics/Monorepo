import { fetchEditionMetadata } from '@devographics/fetch'
import { NextPageParams } from '@/app/typings'
import { decodeChartParams } from '@/app/og/chart-params-encoder'
import { getBlockMeta } from '@/app/og/metadata'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ChartParams } from '@/app/og/typings'

export async function getStaticParams() {}

async function getBlockMetaFromParams(chartParams: ChartParams) {
    const { data: currentEdition, error } = await fetchEditionMetadata({
        surveyId: chartParams.survey,
        editionId: chartParams.edition
    })
    if (error)
        throw new Error(
            `Error while fetching edition metadata (survey: ${chartParams.survey}, edition: ${
                chartParams.edition
            }): ${error.toString()}`
        )
    const blockMeta = getBlockMeta({
        block: {
            id: chartParams.question,
            sectionId: chartParams.section,
            parameters: {}
        },
        currentEdition,
        // TODO
        currentPath: 'TODO: section for this chart',
        host: 'TODO: result app url for this edition',
        // TODO: do an actual translation, we can take the surveyform as inspiration
        // for loading and translating locales in the backend
        getString: key => ({ t: key, locale: { id: chartParams.lang } })
    })
    return blockMeta
}
export async function generateMetadata({
    params
}: NextPageParams<{ chartParams: string }>): Promise<Metadata> {
    const chartParams = await decodeChartParams(params.chartParams)
    console.log('metadata chartParams', chartParams, 'params', params)
    const blockMeta = await getBlockMetaFromParams(chartParams)
    console.log({ blockMeta })
    const { title, subtitle, link } = blockMeta

    // TODO: where do we host images in this case?
    const imgUrl = '/demo/demo-chart.png'

    return {
        // TODO: set more params like the site name
        // depending on the current survey etc.
        // Those are the chart specific values:
        title,
        description: subtitle,
        openGraph: {
            title,
            description: subtitle,
            images: [imgUrl],
            url: link
        },
        twitter: {
            images: [imgUrl],
            title
        }
    }
}

export default async function StaticChartRedirectionPage({
    params
}: NextPageParams<{ chartParams: string }>) {
    const chartParams = await decodeChartParams(params.chartParams)
    const blockMeta = await getBlockMetaFromParams(chartParams)
    // https://nextjs.org/docs/app/api-reference/functions/generate-metadata#unsupported-metadata
    // equivalent to <meta http-equiv="refresh" content="5; URL=...">
    redirect(blockMeta.link)
    // TODO: we could go further and render the whole chart
    // here directly, with a button to manually access the results?
    return <div>Redirecting to the result app...</div>
}
