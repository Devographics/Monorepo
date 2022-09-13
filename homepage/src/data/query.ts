export const getAllSurveysQuery = () => /* GraphQL */`
  query AllSurveys {
    allSurveys {
      slug
      hashtag
      name
      domain
      emailOctopus{
        listId
      }
      editions {
        surveyId
        startedAt
        endedAt
        year
        status
        questionsUrl
        resultsUrl
        imageUrl
        socialImageUrl
        faviconUrl
        tags
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
`

export const getAllLocalesQuery = (surveySlug) => /* GraphQL */`
  query AllLocales {
    locales(contexts: [homepage, ${surveySlug}]) {
      id
      label
      strings {
        key
        t
        tHtml
        context
        isFallback
        aliasFor
      }
      translators
    }
  }
`