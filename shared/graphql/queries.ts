export const getEntityFragment = () => `entity {
    name
    nameHtml
    nameClean
    id
    homepage {
      url
    }
    youtube {
      url
    }
    twitter {
      url
    }
    twitch {
      url
    }
    rss {
      url
    }
    blog { 
        url
    }
    mastodon {
        url
    }
    github {
        url
    }
    npm {
        url
    }
}`

export const getFacetFragment = addEntities => `
    facetBuckets {
        id
        count
        percentageQuestion
        percentageSurvey
        percentageFacet
        ${addEntities ? getEntityFragment() : ''}
    }
`

export const getSurveysQuery = ({ includeQuestions = true }) => `
query SurveysMetadataQuery {
  _metadata {
    surveys {
      id
      name
      dbCollectionName
      domain
      hashtag
      editions {
        id
        surveyId
        year
        status
        imageUrl
        colors {
          primary
          secondary
          text
          background
          backgroundSecondary
        }
        ${
            includeQuestions
                ? `sections {
          id
          slug
          questions {
            id
            label
            contentType
            template
            extends
            allowOther
            matchTags
            options {
              average
              id
              label
            }
          }
        }`
                : ''
        }
      }
    }
  }
}`

export const getSurveyQuery = ({ surveyId }) => `
query SurveyMetadataQuery {
  surveys {
    ${surveyId} {
      _metadata {
        id
        name
        dbCollectionName
        domain
        hashtag
        editions {
          id
          surveyId
          year
          status
          imageUrl
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
  }
}`

export const getEditionQuery = ({ surveyId, editionId }) => `
query ${editionId}MetadataQuery {
  _metadata(editionId: ${editionId}) {
    surveys {
      domain
      id
      name
      hashtag
      partners {
        id
        name
        url
        imageUrl
      }
      editions {
        id
          surveyId
          year
          status
          hashtag
          startedAt
          endedAt
          questionsUrl
          resultsUrl
          imageUrl
          faviconUrl
          socialImageUrl
          colors {
            primary
            secondary
            text
            background
            backgroundSecondary
          }
          sponsors {
            id
            imageUrl
            name
            url
          }
          credits {
            id
            role
          }
          sections {
            id
            slug
            intlId
            questions {
              id
              label
              intlId
              template
              extends
              contentType
              allowOther
              matchTags
              optionsAreNumeric
              optionsAreRange
              entity {
                nameClean
                name
                nameHtml
                example {
                  language
                  code
                  codeHighlighted
                }
              }
              rawPaths {
                response
                other
                comment
              }
              normPaths {
                response
                other
                comment
                raw
                patterns
                error
              }
              options {
                id
                label
                average
                entity {
                  nameClean
                  name
                  nameHtml
                  example {
                    language
                    code
                    codeHighlighted
                  }
                }
              }
            }
          }
      }
    }
  }
}
`

export const getEditionQuerySurveyForm = ({ surveyId, editionId }) => `
query ${editionId}MetadataQuery {
  _metadata(editionId: ${editionId}) {
    surveys {
      editions {
        id
        surveyId
        year
        status
        hashtag
        startedAt
        endedAt
        questionsUrl
        resultsUrl
        imageUrl
        faviconUrl
        socialImageUrl
        colors {
          primary
          secondary
          text
          background
          backgroundSecondary
        }
        survey {
          domain
          id
          name
          hashtag
          partners {
            id
            name
            url
            imageUrl
          }
        }
        sponsors {
          id
          imageUrl
          name
          url
        }
        credits {
          id
          role
        }
        sections {
          id
          slug
          intlId
          questions {
            id
            intlId
            yearAdded
            limit
            template
            extends
            # contentType
            allowOther
            optionsAreNumeric
            # optionsAreRange
            entity {
              nameClean
              nameHtml
              example {
                language
                code
                codeHighlighted
              }
            }
            rawPaths {
              response
              other
              comment
            }
            options {
              id
              entity {
                nameClean
                nameHtml
              }
            }
          }
        }
      }
    }
  }
}
`
