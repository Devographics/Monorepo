import { getStringTranslator } from '@helpers/translator'

export const getMeta = ({ survey, locale }) => {
    const { name, socialImageUrl, slug, domain } = survey

    const getString = getStringTranslator(locale)

    const description = getString(`general.${slug}.description`)?.t
    const title = name
    const url = `https://${domain}`

    const meta = [
        { charset: 'utf-8' },
        { name: 'description', content: description },
        // responsive
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // facebook
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: url },
        { property: 'og:image', content: socialImageUrl },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        // twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image:src', content: socialImageUrl },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description }
    ]
    return meta
}
