/**
 * Serve images prerendered by our Capture tool
 * See "capture" folder for instructions
 * Images are hosted at
 */
import { getBlockMetaFromParams } from '@/app/share/metadata'
import { Metadata } from 'next'
// import { redirect } from 'next/navigation'
import { ChartParams, chartParamsSchema } from '@/app/share/typings'
import { getAppConfig } from '@/config/server'
import { chartParamsFromSearch } from '../chart-params-encoder'
import { notFound } from 'next/navigation'

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

function devographicsImageUrl({
    editionId,
    localeId,
    blockId
}: {
    /**
     * css2022
     */
    editionId: string
    /**
     * fr-FR
     */
    localeId: string
    /**
     * Unique block id = question
     */
    blockId: string
}) {
    const capturesUrl = `https://assets.devographics.com/captures/${editionId}`
    return `${capturesUrl}/${localeId}/${blockId}.png`
}

export async function generateMetadata({ searchParams }): Promise<Metadata> {
    const chartParams = chartParamsFromSearch(searchParams)
    if (!chartParams) {
        // will use the root layout default metadata in case of error
        return {}
    }
    const { blockDefinition, blockMeta } = await getBlockMetaFromParams(chartParams)
    const { title, description, link } = blockMeta

    const imgUrl = devographicsImageUrl({
        editionId: chartParams.editionId,
        localeId: chartParams.localeId,
        blockId: chartParams.blockId
    })

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

export default async function StaticChartRedirectionPage({ searchParams }) {
    const chartParams = chartParamsFromSearch(searchParams)
    if (!chartParams) {
        // 404 if params are not valid
        return notFound()
    }
    const { blockDefinition, blockMeta } = await getBlockMetaFromParams(chartParams)
    const config = getAppConfig()
    if (config.isDev || config.isDebug) {
        const imgUrl = devographicsImageUrl({
            editionId: chartParams.editionId,
            localeId: chartParams.localeId,
            blockId: chartParams.blockId
        })
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
                        <a href={blockMeta.link}>{blockMeta.link}</a>
                    </div>
                </div>
                <head>
                    {/* <meta httpEquiv="refresh" content={`5; URL="${blockMeta.link}"`}></meta> */}
                </head>
            </div>
        )
    }
    // A server redirect isn't appropriate here, we wan't the browser to trigger the redirect:
    // @see https://github.com/vercel/next.js/issues/54437
    // redirect(blockMeta.link)
    return (
        <head>
            <meta httpEquiv="refresh" content={`0; URL="${blockMeta.link}"`}></meta>
        </head>
    )
    // equivalent to <meta http-equiv="refresh" content="5; URL=...">
    // TODO: we could go further and render the whole chart
    // here directly, with a button to manually access the results?
}
