/*

Unless specified, these queries are designed to be used by surveyform

*/

export const getSurveysQuery = () => `
query SurveysMetadataQuery {
  _metadata {
    surveys {
      id
      name
      dbCollectionName
      domain
      hashtag
      imageUrl
      emailOctopus {
        listId
      }
      editions {
        id
        questionsUrl
        resultsUrl
        surveyId
        startedAt
        endedAt
        year
        status
        imageUrl
        faq
        sections {
          id
        }
        credits {
          id
          role
          entity {
            id
            name
            twitterName
            company {
              name
              homepage {
                url
              }
            }
          }
        }
        colors {
          primary
          secondary
          text
          background
          backgroundSecondary
        }
      }
    }
  }
}`
