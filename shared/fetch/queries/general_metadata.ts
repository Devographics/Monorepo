export const getGeneralMetadataQuery = () => `
query GeneralMetadataQuery {
  _metadata {
    general {
      creators {
        id
        entity {
          id
          name
          homepageUrl
          avatar {
            url
          }
        }
      }
    }
  }
}`
