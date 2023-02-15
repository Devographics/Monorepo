import { Field, Section } from './types'
import { TOOLS_OPTIONS, FEATURES_OPTIONS } from './constants'
import { capitalize } from './helpers/utilities'

const isFreeformField = (id: string) => ['_others', '_freeform'].some(s => id.includes(s))

const getSuffix = (id: string) => (isFreeformField(id) ? 'others.normalized' : 'choices')

const defaultGetPath = (id: string, section: string) => `${section}.${id}.${getSuffix(id)}`

export const defaultTemplate = (field: Field, section: Section): Field => {
    const { id, options } = field
    const fieldDefinition = {
        path: `${section.id}.${id}.${getSuffix(id)}`
    } as Field
    return fieldDefinition
}

export const templates = {
    // demographics: {
    //   path: (id:string) => `user_info.${id}.${getSuffix(id)}`
    // },
    features: ({ id }: { id: string }) => ({
        path: `features.${id}.choices`,
        options: FEATURES_OPTIONS.map(id => ({
            id
        })),
        fieldTypeName: 'Feature',
        filterTypeName: 'FeatureExperienceFilter',
        optionsTypeName: 'FeatureExperienceID'
    }),
    tools: ({ id }: { id: string }) => ({
        path: `tools.${id}.choices`,
        options: TOOLS_OPTIONS.map(id => ({
            id
        })),
        fieldTypeName: 'Tool',
        filterTypeName: 'ToolExperienceFilter',
        optionsTypeName: 'ToolExperienceID'
    })
    // resources: {
    //   path: (id:string) => `resources.${id}.${getSuffix(id)}`
    // },
    // usage: {
    //   path: (id:string) => `usage.${id}.${getSuffix(id)}`
    // },
    // opinions: {
    //   path: (id:string) => `opinions.${id}.${getSuffix(id)}`
    // }
}

export const getTemplate = (field: Field, section: Section) => {
    const templateName = field.templateName || section.template
    const template = templates[templateName] || defaultTemplate
    return template
}

export const applyTemplate = (field: Field, section: Section) => {
    const template = getTemplate(field, section)
    const fieldWithTemplate = template(field, section)
    return { ...fieldWithTemplate, ...field, sectionId: section.id }
}
