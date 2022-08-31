import fetch from 'node-fetch'

interface MDNJSONRes {
    doc: TranslatedMDNInfo
}

interface TranslatedMDNInfo {
    locale: string
    title: string
    summary: string
    mdn_url?: string
    url?: string
}

interface MDNInfo extends TranslatedMDNInfo {
    translations: TranslatedMDNInfo[]
}

export const normalizeMdnResource = (res: MDNJSONRes): TranslatedMDNInfo[] => {
    const { locale, title, summary, mdn_url } = res.doc
    return [
        {
            locale,
            title,
            summary,
            url: `https://developer.mozilla.org${mdn_url}`
        }
    ]
}

export const fetchMdnResource = async ({ path }: { path: string }) => {
    try {
        const pathWithoutAnchor = path.split('#')[0]
        const url = `https://developer.mozilla.org${pathWithoutAnchor}/index.json`
        const res = await fetch(url)
        const json = (await res.json()) as MDNJSONRes

        return normalizeMdnResource(json)
    } catch (error) {
        console.error(`an error occurred while fetching mdn resource ${path}`)
        // throw error
        return
    }
}
