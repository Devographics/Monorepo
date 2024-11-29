const convertToGraphQLEnum = (s: string) => s.replace('-', '_')

// TODO: move to locales specific code
export const getLocalesQuery = (contexts, loadStrings = true) => {
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
    dataAPI {
        locales${argumentsString} {
            completion
            id
            label
            active
            ${
                loadStrings
                    ? `strings {
                key
                t
                tHtml
                tClean
                context
                isFallback
                active
            }`
                    : ''
            }
            translators
        }
    }
}
`
}

export const getLocaleContextQuery = (localeId, context) => {
    return `
query {
    dataAPI {
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
}
`
}
