const SAMPLE_KEYS = [
    'general.surveys_available_languages',
    'general.results.description',
    'general.share'
] as const

type LocalizedPageProps = {
    locale: string
    slug: string
}

export async function LocalizedPage({ locale: localeId, slug }: LocalizedPageProps) {
    console.log('Rendering LocalizedPage with localeId:', localeId, 'and slug:', slug)
    return (
        <div>
            <p>
                Rendering LocalizedPage with localeId: {localeId} and slug: {slug}
            </p>
        </div>
    )
}
