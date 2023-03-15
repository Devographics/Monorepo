import capitalize from 'lodash/capitalize.js'

export const getLocalesQuery = (localeIds, contexts, loadStrings = true) => {
    const args = []
    if (localeIds.length > 0) {
        args.push(`localeIds: [${localeIds.map(id => `"${id}"`).join(',')}]`)
    }
    if (contexts.length > 0) {
        args.push(`contexts: [${contexts.join(', ')}]`)
    }

    const argumentsString = args.length > 0 ? `(${args.join(', ')})` : ''

    return `
query {
    internalAPI {
        locales${argumentsString} {
            completion
            id
            label
            ${
                loadStrings
                    ? `strings {
                key
                t
                tHtml
                tClean
                context
                isFallback
            }`
                    : ''
            }
            translators
        }
    }
}
`
}

const entityFragment = `entity {
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

export const getMetadataQuery = ({ surveyId, editionId }) => {
    return `
query {
    dataAPI {
        surveys {
            ${surveyId} {
                _metadata {
                    domain
                    id
                    name
                }
                ${editionId} {
                    _metadata {
                        id
                        year
                        status
                        started_at
                        ended_at
                        questions_url
                        results_url
                        image_url
                        favicon_url
                        social_image_url
                        sections {
                            id
                            questions {
                            entity {
                                id
                                name
                                nameClean
                                nameHtml
                            }
                            options {
                                ${entityFragment}
                                id
                            }
                            id
                            }
                        }
                    }
                }
            }
        }
    }
}`
}

const unquote = s => s.replace(/"([^"]+)":/g, '$1:')

export const getDefaultQueryBody = ({
    surveyId,
    editionId,
    sectionId,
    questionId,
    parameters,
    addEntities = false
}) => {
    const parametersString = parameters
        ? `(parameters: ${unquote(JSON.stringify(parameters))})`
        : ''

    return `
surveys {
  ${surveyId} {
    ${editionId} {
      ${sectionId} {
        ${questionId} {
          responses${parametersString} {
            current_edition {
              completion {
                count
                percentage_survey
                total
              }
              buckets {
                count
                id
                percentage_question
                percentage_survey
                ${addEntities ? entityFragment : ''}
              }
            }
          }
        }
      }
    }
  }
}
`
}

export const getDefaultQueryName = options =>
    `${options.editionId}${capitalize(options.questionId)}Query`

export const getDefaultQuery = options => `
query ${getDefaultQueryName(options)} {
  dataAPI {
      ${getDefaultQueryBody(options)}
  }
}`
