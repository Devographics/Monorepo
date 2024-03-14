const convertToGraphQLEnum = (s: string) => s.replace('-', '_')

// TODO: move to locales specific code
export const getLocalesQuery = (contexts: Array<string>, loadStrings = true) => {
    const args: Array<string> = []
    // if (localeIds.length > 0) {
    //     args.push(`localeIds: [${localeIds.map(convertToGraphQLEnum).join(',')}]`)
    // }
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