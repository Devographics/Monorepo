import { NextPageParams } from '@/app/typings'
import { decodeChartParams, encodeChartParams } from '@/app/og/chart-params-encoder'
import { getBlockMetaFromParams } from '@/app/og/metadata'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ChartParams } from '@/app/og/typings'

export async function generateStaticParams(): Promise<Array<{ chartParams: string }>> {
    const prerendered: Array<ChartParams> = [
        {
            lang: 'en-US',
            survey: 'state_of_css',
            edition: 'css2022',
            section: 'environment',
            question: 'browser'
        }
        // Prerender wharever combination you want
        // other combinations will be rendered on demand
    ]
    // encode the params in a single route parameters
    return prerendered.map(chartParams => ({
        chartParams: encodeChartParams(chartParams)
    }))
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
    // return <div>Redirecting to the result app...</div>
}
