/*

Unless specified, these queries are designed to be used by surveyform

*/

export const getSurveysQuery = () => `
query SurveysMetadataQuery {
  _metadata {
    surveys {
      id
      name
      isDemo
      responsesCollectionName
      normalizedCollectionName
      domain
      hashtag
      imageUrl
      emailOctopus {
        listId
        submitUrl
      }
      partners {
        id
        imageUrl
        name
        url
      }
      editions {
        id
        questionsUrl
        issuesUrl
        discordUrl
        feedbackUrl
        resultsUrl
        surveyId
        feedbackAt
        startedAt
        endedAt
        releasedAt
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
            homepageUrl
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
