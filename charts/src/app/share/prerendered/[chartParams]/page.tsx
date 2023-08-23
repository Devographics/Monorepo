/**
 * Serve images prerendered by our Capture tool
 * See "capture" folder for instructions
 * Images are hosted at
 */
import { NextPageParams } from '@/app/typings'
import { decodeChartParams, encodeChartParams } from '@/app/share/chart-params-encoder'
import { getBlockMetaFromParams } from '@/app/share/metadata'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ChartParams } from '@/app/share/typings'

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

/**
 * Demo path using the Devographics/images repository
 * as our image database
 *
 * See the "capture" app to see how those files are generated
 *
 * /!\ Is it suited for production?
 * /!\ Might be slow?
 * /!\ We suppose chart names are unique across sections
 *
 * https://github.com/Devographics/images
 * @param param0
 * @returns
 */
function githubUrl({
    editionId,
    lang = 'en-US',
    chart
}: {
    editionId: string
    /**
     * Country-region format
     * @example fr-FR
     */
    lang?: string
    chart: ChartParams
}) {
    const org = 'Devographics'
    const repo = 'images'
    return `https://raw.githubusercontent.com/${org}/${repo}/main/captures/${editionId}/${lang}/${chart.question}.png`
}

function devographicsUrl({
    editionId,
    lang,
    blockId
}: {
    /**
     * css2022
     */
    editionId: string
    /**
     * fr-FR
     */
    lang: string
    /**
     * Unique block id = question
     */
    blockId: string
}) {
    const capturesUrl = `https://assets.devographics.com/captures/${editionId}`
    return `${capturesUrl}/${lang}/${blockId}.png`
}

export async function generateMetadata({
    params
}: NextPageParams<{ chartParams: string }>): Promise<Metadata> {
    const chartParams = await decodeChartParams(params.chartParams)
    const blockMeta = await getBlockMetaFromParams(chartParams)
    const { title, subtitle, link } = blockMeta

    const imgUrl = devographicsUrl({
        editionId: chartParams.edition,
        lang: chartParams.lang,
        blockId: chartParams.question
    })

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
    console.log('PARAMS', chartParams, params.chartParams)
    const blockMeta = await getBlockMetaFromParams(chartParams)
    if (process.env.NODE_ENV === 'development') {
        const imgUrl = devographicsUrl({
            editionId: chartParams.edition,
            lang: chartParams.lang,
            blockId: chartParams.question
        })
        return (
            <div>
                <h1>DEV MODE</h1>
                <p>Open the devtools to verify the page metadata headers</p>
                <img src={imgUrl} />
                <a href={blockMeta.link}>See this chart in context</a>
            </div>
        )
    }
    // https://nextjs.org/docs/app/api-reference/functions/generate-metadata#unsupported-metadata
    // equivalent to <meta http-equiv="refresh" content="5; URL=...">
    // TODO: we could go further and render the whole chart
    // here directly, with a button to manually access the results?
    console.log('Redirecting to:', blockMeta.link)
    redirect(blockMeta.link)
}