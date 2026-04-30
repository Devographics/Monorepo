import { ApiTemplateFunction, ResolverParent, ResolverType } from '../../types/surveys'

export const getExternalDataTypeValue = (id: string) => `"""
Get external data
"""
${id}: ExternalData`

export const getExternalDataResolver = (id: string) => {
    const resolver: ResolverType = async data => {
        console.log('// external data resolver')
        const { question } = data
        const externalData = question.externalData
        const { currentEdition } = externalData
        const _metadata = { id, hasExternalData: true }
        return { id, _metadata, responses: { ...data, currentEdition } }
    }
    return resolver
}

export const external_data: ApiTemplateFunction = ({ survey, edition, section, question }) => {
    const id = question.id || 'no_id'
    return {
        ...question,
        id,
        generatedBy: 'external_data',
        typeValue: getExternalDataTypeValue(id),
        resolver: getExternalDataResolver(id)
    }
}
