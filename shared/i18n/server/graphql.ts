const convertToGraphQLEnum = (s: string) => s.replace('-', '_')

export const localeWithStringsQuery = ({ localeId, contexts }: { localeId: string, contexts: Array<string> }) => {
    // en-US must become en_US ion the query
    // we do not need GraphQL variables because the localeId and contexts are not dynamic,
    // they are known ahead of time
    return `
    {
        locale(localeId: ${localeId.replaceAll("-", "_")}, contexts:[${contexts.join(",")}]) {
            id
            strings {
                key
                t
                tHtml
                tClean
            }
        }
    }
    `
}

export const getLocalesQuery = (contexts: Array<string>, loadStrings = true) => {
    const args: Array<string> = []
    if (contexts.length > 0) {
        args.push(`contexts: [${contexts.join(', ')}]`)
    }

    const argumentsString = args.length > 0 ? `(${args.join(', ')})` : ''
    return `
query {
        locales${argumentsString} {
            completion
            id
            label
            ${loadStrings
            ? `strings {
                key
                t
                tHtml
                tClean
                context
                isFallback
            }`
            : ''
        }
            translators
        }
}
`
}

export const getLocaleContextQuery = (localeId: string, context: string) => {
    return `
query {
        locale(localeId: ${convertToGraphQLEnum(localeId)}, contexts: [${context}]) {
            id
            label
            strings {
                key
                t
                tHtml
                tClean
                context
                isFallback
            }
        }
}
`
}