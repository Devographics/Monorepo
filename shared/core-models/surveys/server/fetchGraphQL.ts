import { SurveyEdition, SurveyEditionDescription, SurveySharedContext } from '../typings'
import { SurveyMetadata } from '@devographics/types'

const getSurveysQuery = () => `
query SurveysMetadataQuery {
    _metadata {
      surveys {
        id
        name
        domain
        editions {
          id
          status
          sections {
            id
            questions {
              dbPath
              id
              label
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
