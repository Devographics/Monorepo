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

export const getAllLocalesMetadataQuery = (surveySlug) => /* GraphQL */`
  query AllLocales {
    locales(contexts: [homepage, ${surveySlug}]) {
      id
      label
      translators
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

export const getSingleLocaleQuery = (localeId, surveySlug) => /* GraphQL */`
  query SingleLocale {
    locale(contexts: [homepage, ${surveySlug}], localeId: "${localeId}") {
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