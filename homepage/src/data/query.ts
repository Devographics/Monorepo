export default /* GraphQL */`
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
        createdAt
        year
        status
        shareUrl
        resultsUrl
        imageUrl
      }
      colors {
        primary
        secondary
        text
        background
        backgroundSecondary
      }
    }  
    locales(contexts: [homepage]) {
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