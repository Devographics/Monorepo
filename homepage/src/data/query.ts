export default (surveySlug) => /* GraphQL */`
  query AllSurveys {
    surveys {
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
    locales(contexts: [homepage, ${surveySlug}]) {
      id
      label
      strings {
        key
        t
        tHtml
        context
        fallback
        aliasFor
      }
      translators
    }
  }
`