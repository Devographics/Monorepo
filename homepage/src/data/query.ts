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
        createdAt
        year
        status
        shareUrl
        questionsUrl
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
    locales(contexts: [homepage, results, common, ${surveySlug}]) {
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