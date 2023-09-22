/*

Unless specified, these queries are designed to be used by surveyform

*/

export const getSurveysQuery = () => `
query SurveysMetadataQuery {
  _metadata {
    surveys {
      id
      name
      responsesCollectionName
      normalizedCollectionName
      domain
      hashtag
      imageUrl
      emailOctopus {
        listId
      }
      editions {
        id
        questionsUrl
        feedbackUrl
        resultsUrl
        surveyId
        startedAt
        endedAt
        year
        status
        resultsStatus
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
