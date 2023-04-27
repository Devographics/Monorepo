import { SurveyMetadata } from '@devographics/types'

const getSurveysQuery = () => `
query SurveysMetadataQuery {
    _metadata {
      surveys {
        id
        name
        dbCollectionName
        domain
        editions {
          id
          surveyId
          year
          status
          sections {
            id
            questions {
              id
              label
              contentType
              template
              allowOther
              matchTags
              options {
                average
                id
                label
              }
            }
          }
        }
      }
    }
  }`

export const fetchSurveysListGraphQL = async ({
  apiUrl
}): Promise<Array<SurveyMetadata>> => {
  console.log('// fetchSurveysList GraphQL')
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ query: getSurveysQuery(), variables: {} })
  })
  const json: any = await response.json()
  if (json.errors) {
    console.log('// surveysQuery API query error')
    console.log(JSON.stringify(json.errors, null, 2))
    throw new Error()
  }
  const surveys = json.data._metadata.surveys as SurveyMetadata[]

  return surveys
}
