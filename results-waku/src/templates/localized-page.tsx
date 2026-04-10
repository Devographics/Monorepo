import path from 'node:path'
import { loadSitemap, findSitemapPage } from '../load-sitemap'
import { getEditionId, getSurveyId } from '../lib/i18n'
import {
    fetchBlockData,
    fetchSectionItems,
    getBlockQuerySpec,
    type BlockResult,
    type SectionItemResult
} from '../lib/survey-query'
import { allowedCachingMethods } from '@/lib/load'

type LocalizedPageProps = {
    locale: string
    slug: string
}

export async function LocalizedPage({ locale: localeId, slug }: LocalizedPageProps) {
    const editionId = getEditionId()
    const surveyId = getSurveyId()
    const sitemapPath = path.resolve(`./src/surveys/${editionId}/config/raw_sitemap.yml`)
    const sitemapPages = loadSitemap(sitemapPath)
    const pageInfo = findSitemapPage(sitemapPages, `/${slug}/`)

    const specs = (pageInfo?.blocks ?? [])
        .map(block => getBlockQuerySpec(block, pageInfo!.id))
        .filter(spec => spec !== null)

    const questionSpecs = specs.filter(s => s.kind === 'question')
    const itemsSpecs = specs.filter(s => s.kind === 'items')

    // deduplicate items specs by sectionId - each section is fetched once
    const uniqueItemsSections = [...new Map(itemsSpecs.map(s => [s.sectionId, s])).values()]

    const [blockResults, sectionResults] = await Promise.all([
        Promise.all(questionSpecs.map(spec => fetchBlockData(surveyId, editionId, spec))),
        Promise.all(
            uniqueItemsSections.map(spec => fetchSectionItems(surveyId, editionId, spec.sectionId))
        )
    ])

    const getBucketPercentage = (percentageQuestion?: number) => (percentageQuestion ?? 0).toFixed(1)

    return (
        <section>
            <h1>results-waku</h1>
            <p>
                locale: {localeId} / page: {pageInfo?.id ?? slug}
            </p>

            {blockResults
                .filter((r): r is BlockResult => r !== null)
                .map(result => (
                    <div key={result.blockId}>
                        <h2>{result.blockId}</h2>
                        <p>
                            respondents: {result.edition.completion.count} /{' '}
                            {result.edition.completion.total}
                        </p>
                        <ul>
                            {result.edition.buckets.map(b => (
                                <li key={b.id}>
                                    {b.id}: {b.count} ({getBucketPercentage(b.percentageQuestion)}%)
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

            {sectionResults
                .filter((r): r is SectionItemResult => r !== null)
                .map(result => (
                    <div key={result.sectionId}>
                        <h2>{result.sectionId}</h2>
                        <ul>
                            {result.items.map(item => (
                                <li key={item.id}>
                                    <strong>{item.id}</strong>: respondents{' '}
                                    {item.edition.completion.count} /{' '}
                                    {item.edition.completion.total}
                                    <ul>
                                        {item.edition.buckets.map(b => (
                                            <li key={b.id}>
                                                {b.id}: {b.count} ({getBucketPercentage(b.percentageQuestion)}
                                                %)
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
        </section>
    )
}
