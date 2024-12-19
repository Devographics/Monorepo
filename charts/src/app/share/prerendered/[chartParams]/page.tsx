/**
 * Serve images prerendered by our Capture tool
 * See "capture" folder for instructions
 * Images are hosted at
 */
import { NextPageParams } from '@/app/typings'
import { decodeChartParams, encodeChartParams } from '@/app/share/chart-params-encoder'
import { getBlockMetaFromParams, getEdition, getEditionOrBlock } from '@/app/share/metadata'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ChartParams } from '@/app/share/typings'
import { getAppConfig } from '@/config/server'
import { fetchEditionSitemap } from '@devographics/fetch'

export async function generateStaticParams(): Promise<Array<{ chartParams: string }>> {
    const prerendered: Array<ChartParams> = [
        {
            localeId: 'en-US',
            surveyId: 'state_of_js',
            editionId: 'js2024',
            sectionId: 'user_info',
            blockId: 'country'
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
    localeId = 'en-US',
    chart
}: {
    editionId: string
    /**
     * Country-region format
     * @example fr-FR
     */
    localeId?: string
    chart: ChartParams
}) {
    const org = 'Devographics'
    const repo = 'images'
    return `https://raw.githubusercontent.com/${org}/${repo}/main/captures/${editionId}/${localeId}/${chart.blockId}.png`
}

export async function generateMetadata({
    params
}: NextPageParams<{ chartParams: string }>): Promise<Metadata> {
    const chartParams = await decodeChartParams(params.chartParams)
    const { imgUrl, link, blockDefinition, blockMeta, title, description } =
        await getEditionOrBlock(chartParams)
    return {
        // TODO: set more params like the site name
        // depending on the current survey etc.
        // Those are the chart specific values:
        title,
        description,
        openGraph: {
            title,
            description,
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
    const { surveyId, editionId } = chartParams
    console.log('PARAMS', chartParams, params.chartParams)

    const { imgUrl, link, blockDefinition, blockMeta, title, description } =
        await getEditionOrBlock(chartParams)

    console.log('Redirecting to:', link)
    const config = getAppConfig()
    if (config.isDev || config.isDebug) {
        return (
            <div>
                <h1>DEV MODE</h1>
                <div className="grid">
                    <div>
                        <h3>Block Definition</h3>
                        <pre>
                            <code>{JSON.stringify(blockDefinition, null, 2)}</code>
                        </pre>
                    </div>
                    <div>
                        <h3>Block Meta</h3>
                        <pre>
                            <code>{JSON.stringify(blockMeta, null, 2)}</code>
                        </pre>
                    </div>
                </div>
                <div className="grid">
                    <div>
                        <h3>Image</h3>
                        <img src={imgUrl} />
                        <pre>
                            <code>{imgUrl}</code>
                        </pre>
                    </div>
                    <div>
                        <h3>Link</h3>
                        <p>
                            <a href={link}>{link}</a>
                        </p>
                        <h3>Title</h3>
                        <p>{title}</p>
                        <h3>Description</h3>
                        <p>{description}</p>
                    </div>
                </div>
                <head>
                    {/* <meta httpEquiv="refresh" content={`5; URL="${redirectLink}"`}></meta> */}
                </head>
            </div>
        )
    }
    // A server redirect isn't appropriate here, we wan't the browser to trigger the redirect:
    // @see https://github.com/vercel/next.js/issues/54437
    // redirect(redirectLink)
    return (
        <head>
            <meta httpEquiv="refresh" content={`0; URL="${link}"`}></meta>
        </head>
    )
    // equivalent to <meta http-equiv="refresh" content="5; URL=...">
    // TODO: we could go further and render the whole chart
    // here directly, with a button to manually access the results?
}
