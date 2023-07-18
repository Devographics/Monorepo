export const getLocaleQuery = ({
    localeId,
    contexts
}: {
    localeId: string
    contexts: string[]
}) => `
  query Locale__${localeId.replace('-', '_')}__${contexts.join('_')}__Query {
    locale(localeId: ${localeId.replace('-', '_')}, contexts: [${contexts.join(', ')}]) {
      id
      completion
      label
      repo
      totalCount
      translatedCount
      translators
      strings {
        tHtml
        t
        tClean
        key
        isFallback
        context
        aliasFor
      }
    }
  }`
