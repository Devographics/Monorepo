import path from 'node:path'
import getSyntaxFeaturesDocument from '../graphql/get-syntax-features.graphql'
import { requestGraphql } from '../lib/graphql/client'
import { loadSitemap, findSitemapPage } from '../load-sitemap'

const EDITIONID = process.env.EDITIONID || 'js2025'

type Bucket = {
    id: string
    count: number
    percentageQuestion: number
    percentageSurvey: number
}

type SyntaxFeaturesEdition = {
    editionId: string
    year: number
    completion: { count: number; percentageSurvey: number; total: number }
    buckets: Bucket[]
}

type SyntaxFeaturesData = {
    id: string
    responses: {
        allEditions: SyntaxFeaturesEdition[]
    }
}

type SyntaxFeaturesQueryResult = {
    surveys: {
        state_of_js: {
            js2025: {
                features: {
                    syntax_features: SyntaxFeaturesData
                }
            }
        }
    }
}

const fetchSyntaxFeatures = async (): Promise<SyntaxFeaturesEdition | null> => {
    try {
        const data = await requestGraphql<SyntaxFeaturesQueryResult>(getSyntaxFeaturesDocument)
        const editions =
            data?.surveys?.state_of_js?.js2025?.features?.syntax_features?.responses?.allEditions
        return editions?.[0] ?? null
    } catch (error) {
        console.error('Failed to fetch syntax_features:', error)
        return null
    }
}

type LocalizedPageProps = {
    locale: string
    slug: string
}

export async function LocalizedPage({ locale: localeId, slug }: LocalizedPageProps) {
    const sitemapPath = path.resolve(`./src/surveys/${EDITIONID}/config/raw_sitemap.yml`)
    const sitemapPages = loadSitemap(sitemapPath)
    const pageInfo = findSitemapPage(sitemapPages, `/${slug}/`)

    const hasSyntaxFeatures = pageInfo?.blocks.some(b => b.id === 'syntax_features') ?? false

    const syntaxFeaturesEdition = hasSyntaxFeatures ? await fetchSyntaxFeatures() : null

    return (
        <section>
            <h1>results-waku</h1>
            <p>locale: {localeId}</p>
            <p>page: {pageInfo?.id ?? slug}</p>

            {syntaxFeaturesEdition && (
                <div>
                    <h2>Syntax Features</h2>
                    <p>
                        edition: {syntaxFeaturesEdition.editionId} ({syntaxFeaturesEdition.year})
                    </p>
                    <p>
                        respondents: {syntaxFeaturesEdition.completion.count} /{' '}
                        {syntaxFeaturesEdition.completion.total}
                    </p>
                    <ul>
                        {syntaxFeaturesEdition.buckets.map(bucket => (
                            <li key={bucket.id}>
                                {bucket.id}: {bucket.count} (
                                {bucket.percentageQuestion.toFixed(1)}%)
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    )
}
