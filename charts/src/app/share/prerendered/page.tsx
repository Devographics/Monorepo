/**
 * Serve images prerendered by our Capture tool
 * See "capture" folder for instructions
 * Images are hosted at
 */
import { getEdition, getEditionOrBlock } from '@/app/share/metadata'

import { Metadata } from 'next'
// import { redirect } from 'next/navigation'
import { ChartParams } from '@/app/share/typings'
import { getAppConfig } from '@/config/server'
import { chartParamsFromSearch } from '../chart-params-encoder'

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

export async function generateMetadata({ searchParams }): Promise<Metadata> {
    const chartParams = chartParamsFromSearch(searchParams)
    if (!chartParams) {
        // will use the root layout default metadata in case of error
        return {}
    }
    const { surveyId, editionId } = chartParams

    const { imgUrl, link, blockDefinition, blockMeta, title, description } =
        await getEditionOrBlock(chartParams)

    console.log('Redirecting to:', link)

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

const HttpRedir = ({ url }: { url: string }) => (
    <head>
        <meta httpEquiv="refresh" content={`0; URL="${url}"`}></meta>
    </head>
)

function DevView({ blockDefinition, blockMeta, imgUrl, link, title, description }: any) {
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

export default async function StaticChartRedirectionPage({ searchParams }) {
    const config = getAppConfig()
    const chartParams = chartParamsFromSearch(searchParams)
    let redirectUrl = 'https://stateofjs.com/en-US'
    // If charts params can't be parsed, try to at least redirect towards the survey
    if (!chartParams) {
        const sp = new URLSearchParams(searchParams)
        console.warn(
            "Couldn't find chart from search params",
            sp.toString(),
            'will redirect to survey'
        )
        let url = 'https://stateofjs.com/en-US'
        // TODO: point towards the right survey if surveyId/editionId are available
        const surveyId = sp.get('surveyId')
        const editionId = sp.get('editionId')
        if (surveyId && editionId) {
            try {
                const edition = await getEdition(surveyId, editionId)
                if (edition.resultsUrl) {
                    redirectUrl = edition.resultsUrl
                }
            } catch (err) {
                console.error('Error while fetching edition metadata:', err)
            }
        }
    } else {
        // If charts params are available, try to redirect
        const block = await getEditionOrBlock(chartParams)
        const { link } = block
        redirectUrl = link
        console.log('Redirecting to:', redirectUrl)
        // In dev show a page instead of running the redirection
        if (config.isDev || config.isDebug) {
            return <DevView {...block} />
        }
    }
    if (config.isDev) return <div>Block not found, falling back to: {redirectUrl}</div>
    // A server redirect isn't appropriate here, we wan't the browser to trigger the redirect:
    // @see https://github.com/vercel/next.js/issues/54437
    // redirect(redirectLink)
    return <HttpRedir url={redirectUrl} />
    // equivalent to <meta http-equiv="refresh" content="5; URL=...">
    // TODO: we could go further and render the whole chart
    // here directly, with a button to manually access the results?
}
