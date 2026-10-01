/*

Unless specified, these queries are designed to be used by surveyform

*/

export const getSurveysQuery = ({
    addCredits = true,
    addSponsors = false
}: {
    addCredits?: boolean
    addSponsors?: boolean
}) => `
query SurveysMetadataQuery {
  _metadata {
    surveys {
      id
      name
      isDemo
      status
      responsesCollectionName
      normalizedCollectionName
      domain
      hashtag
      imageUrl
      homepageUrl
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
        ${
            addCredits
                ? `credits {
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
        }`
                : ''
        }
        ${
            addSponsors
                ? `sponsors {
          id
          name
          imageUrl
          url
        }`
                : ''
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
