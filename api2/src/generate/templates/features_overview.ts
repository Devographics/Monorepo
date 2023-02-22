import { TemplateFunction, ResolverType } from '../types'
import { graphqlize } from '../helpers'

export const features_overview: TemplateFunction = ({ survey, question, section }) => {
    const fieldTypeName = graphqlize('features_overview')
    return {
        id: `features_overview`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
            ids: [String]!
            years: [Int]
            all_years(filters: ${graphqlize(survey.id)}Filters): [ToolExperienceRanking]
        }`,
        resolverMap: {
            all_years: (root, args, context, info) => {
                const { filters } = args
                const tools = sectionTools.map(q => q.id)
                return useCache({
                    func: computeToolsExperienceRanking,
                    context,
                    funcOptions: { survey, tools, filters }
                })
            },
            ids: () => {
                return sectionTools.map(q => q.id)
            },
            years: () => {
                return survey.editions.map(e => e.year)
            }
        }
    }
}

// titleId: blocks.features_overview
// blockType: FeaturesOverviewBlock
// dataPath: "dataAPI.survey.${id}"
// keysPath: "dataAPI.survey.${id}.0.experience.keys"
// # enableCustomization: true
// hasSponsor: true
// query: >
//     dataAPI {
//         survey(survey: ${surveyType}) {
//             ${id}: features(ids: [${allFeatures}]) {
//                 id
//                 entity {
//                     name
//                     nameClean
//                     nameHtml
//                     homepage {
//                         url
//                     }
//                     caniuse {
//                         name
//                         url
//                     }
//                     mdn {
//                         locale
//                         url
//                         title
//                         summary
//                     }
//                 }
//                 experience{
//                     keys
//                     year(year: ${currentYear}) {
//                         year
//                         completion {
//                             total
//                             count
//                             percentage_survey
//                         }
//                         facets{
//                             type
//                             id
//                             buckets {
//                                 id
//                                 count
//                                 percentage_question
//                                 percentage_survey
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     }
