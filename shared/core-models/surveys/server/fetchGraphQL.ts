// import type { EditionMetadata, SurveyMetadata, MetadataPackage } from '@devographics/types'

// export const getApiUrl = () => {
//   const apiUrl = process.env.DATA_API_URL
//   if (!apiUrl) {
//     throw new Error('process.env.DATA_API_URL not defined')
//   }
//   return apiUrl
// }

// const getSurveysQuery = ({ includeQuestions = true }) => `
// query SurveysMetadataQuery {
//   _metadata {
//     surveys {
//       id
//       name
//       dbCollectionName
//       domain
//       editions {
//         id
//         surveyId
//         year
//         status
//         ${
//             includeQuestions
//                 ? `sections {
//           id
//           questions {
//             id
//             label
//             contentType
//             template
//             allowOther
//             matchTags
//             options {
//               average
//               id
//               label
//             }
//           }
//         }`
//                 : ''
//         }
//       }
//     }
//   }
// }`

// export const fetchSurveysListGraphQL = async ({
//     includeQuestions
// }): Promise<Array<SurveyMetadata>> => {
//     console.log('// fetchSurveysList GraphQL')
//     const query = getSurveysQuery({ includeQuestions })
//     const result = await fetchGraphQL({ query })
//     return result._metadata.surveys as SurveyMetadata[]
// }

// const getEditionQuery = ({ surveyId, editionId }) => `
// query ${editionId}MetadataQuery {
//   _metadata(editionId: ${editionId}) {
//     surveys {
//       domain
//       id
//       name
//       partners {
//         id
//         name
//         url
//         imageUrl
//       }
//       editions {
//         id
//           surveyId
//           year
//           status
//           hashtag
//           startedAt
//           endedAt
//           questionsUrl
//           resultsUrl
//           imageUrl
//           faviconUrl
//           socialImageUrl
//           sponsors {
//             id
//             imageUrl
//             name
//             url
//           }
//           credits {
//             id
//             role
//           }
//           sections {
//             id
//             intlId
//             questions {
//               id
//               label
//               intlId
//               template
//               contentType
//               allowOther
//               matchTags
//               optionsAreNumeric
//               optionsAreRange
//               entity {
//                 nameClean
//                 name
//                 nameHtml
//                 example {
//                   language
//                   code
//                   codeHighlighted
//                 }
//               }
//               rawPaths {
//                 response
//                 other
//                 comment
//               }
//               normPaths {
//                 response
//                 other
//                 comment
//                 raw
//                 patterns
//                 error
//               }
//               options {
//                 id
//                 label
//                 average
//                 entity {
//                   nameClean
//                   name
//                   nameHtml
//                   example {
//                     language
//                     code
//                     codeHighlighted
//                   }
//                 }
//               }
//             }
//           }
//       }
//     }
//   }
// }
// `

// const getEditionQuerySurveyForm = ({ surveyId, editionId }) => `
// query ${editionId}MetadataQuery {
//   _metadata(editionId: ${editionId}) {
//     surveys {
//       editions {
//         id
//         surveyId
//         year
//         status
//         hashtag
//         startedAt
//         endedAt
//         questionsUrl
//         resultsUrl
//         imageUrl
//         faviconUrl
//         socialImageUrl
//         survey {
//           domain
//           id
//           name
//           partners {
//             id
//             name
//             url
//             imageUrl
//           }
//         }
//         sponsors {
//           id
//           imageUrl
//           name
//           url
//         }
//         credits {
//           id
//           role
//         }
//         sections {
//           id
//           intlId
//           questions {
//             id
//             intlId
//             template
//             # contentType
//             allowOther
//             optionsAreNumeric
//             # optionsAreRange
//             entity {
//               nameClean
//               nameHtml
//               example {
//                 language
//                 code
//                 codeHighlighted
//               }
//             }
//             rawPaths {
//               response
//               other
//               comment
//             }
//             options {
//               id
//               entity {
//                 nameClean
//                 nameHtml
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// }
// `

// export const fetchEditionGraphQL = async ({
//     surveyId,
//     editionId,
// }): Promise<EditionMetadata> => {
//     console.log('// fetchEditionGraphQL')
//     const query = getEditionQuery({ surveyId, editionId })
//     const result = await fetchGraphQL({ query })
//     return result._metadata.surveys[0].editions[0]
// }

// export const fetchEditionGraphQLSurveyForm = async ({
//   surveyId,
//   editionId,
// }): Promise<EditionMetadata> => {
//   console.log('// fetchEditionGraphQLSurveyForm')
//   const query = getEditionQuerySurveyForm({ surveyId, editionId })
//   const result = await fetchGraphQL({ query })
//   return result._metadata.surveys[0].editions[0]
// }

// export const fetchGraphQL = async ({ query }): Promise<any> => {
//     console.log('// fetchSurveysList GraphQL')

//     const response = await fetch(getApiUrl(), {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             Accept: 'application/json'
//         },
//         body: JSON.stringify({ query, variables: {} })
//     })
//     const json: any = await response.json()
//     if (json.errors) {
//         console.log('// surveysQuery API query error')
//         console.log(JSON.stringify(json.errors, null, 2))
//         throw new Error()
//     }
//     return json.data
// }
