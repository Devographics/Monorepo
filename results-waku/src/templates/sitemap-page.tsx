type SitemapPageProps = {
    locale: string
    path: string
    pageId: string
    blocks?: Array<Record<string, unknown>>
    surveyId?: string
    editionId?: string
}

export async function SitemapPage({
    locale,
    path,
    pageId,
    blocks = [],
    surveyId = 'state_of_js',
    editionId = 'js2025'
}: SitemapPageProps) {
    const blockRows = blocks.map((block, index) => ({
        key: `block-${index}`,
        id: String(block?.id ?? 'unknown'),
        blockType: String(block?.blockType ?? ''),
        template: String(block?.template ?? '')
    }))

    return (
        <section>
            <h1>results-waku</h1>
            <h2>stub page from raw_sitemap</h2>
            <p>survey: {surveyId}</p>
            <p>edition: {editionId}</p>
            <p>locale: {locale}</p>
            <p>page: {pageId}</p>
            <p>path: {path}</p>
            <h3>blocks</h3>
            {blockRows.length > 0 ? (
                <ul>
                    {blockRows.map(row => (
                        <li key={row.key}>
                            id: {row.id}
                            {row.blockType ? ` / type: ${row.blockType}` : ''}
                            {row.template ? ` / template: ${row.template}` : ''}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>no blocks found</p>
            )}
            <a href="/">top</a>
        </section>
    )
}
