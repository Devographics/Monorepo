import { TemplateFunction, ResolverMap, Survey, Question } from '../../types/surveys'
import { graphqlize, getFacetsTypeName } from '../helpers'
import { genericComputeFunction } from '../../compute'
import { useCache, computeKey } from '../../helpers/caching'

const getResolverMap = ({ survey }: { survey: Survey }): ResolverMap => ({
    items: async (parent, args, context, info) => {
        console.log('// data_explorer resolver', args.axis1, args.axis2)
        const { survey, edition, section, questionObjects } = parent
        const { axis1, axis2, parameters = {}, filters = {} } = args
        const { enableCache, ...cacheKeyParameters } = parameters

        const [sectionId, questionId] = axis1.split('__')
        const question = questionObjects.find(q => q.id === questionId && q.surveyId === survey.id)

        const selectedEditionId = edition.id
        const computeArguments = {
            parameters,
            filters,
            facet: axis2,
            selectedEditionId
        }

        const funcOptions = {
            survey,
            edition,
            section,
            question,
            context,
            questionObjects,
            computeArguments
        }

        let result = await useCache({
            key: computeKey(genericComputeFunction, {
                surveyId: survey.id,
                editionId: edition.id,
                sectionId,
                questionId,
                parameters: cacheKeyParameters,
                filters,
                facet: axis2,
                selectedEditionId
            }),
            func: genericComputeFunction,
            context,
            funcOptions,
            enableCache
        })
        console.log('// result')
        console.log(result)
        return result
    }
})

export const data_explorer: TemplateFunction = ({ survey, question }) => {
    const fieldTypeName = `${graphqlize(survey.id)}DataExplorer`
    return {
        ...question,
        id: 'data_explorer',
        typeDef: `type ${fieldTypeName} {
        items(axis1: ${getFacetsTypeName(survey.id)}, axis2: ${getFacetsTypeName(
            survey.id
        )}, parameters: DataExplorerParameters, filters: ${graphqlize(
            survey.id
        )}Filters): [ResponseEditionData]
    }`,
        resolverMap: getResolverMap({ survey })
    }
}
