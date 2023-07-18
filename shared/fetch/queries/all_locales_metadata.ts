export const getAllLocalesMetadataQuery = () => `
query AllLocalesMetadataQuery {
  locales {
    id
    completion
    label
    repo
    totalCount
    translatedCount
    translators
  }
}`

export const getAllLocalesIdsQuery = () => `
query AllLocalesIdsQuery {
  locales {
    id
  }
}`
