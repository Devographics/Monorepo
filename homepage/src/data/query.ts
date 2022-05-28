export default /* GraphQL */`
  query AllSurveys {
    surveys {
      slug
      hashtag
      name
      domain
      editions {
        surveyId
        createdAt
        year
        status
        shareUrl
        resultsUrl
        imageUrl
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