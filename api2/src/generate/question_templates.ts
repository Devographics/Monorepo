import { TemplateArguments } from './types'
import { TOOLS_OPTIONS, FEATURES_OPTIONS } from '../constants'

const isFreeformField = (id: string) => ['_others', '_freeform'].some(s => id.includes(s))

const getSuffix = (id: string) => (isFreeformField(id) ? 'others.normalized' : 'choices')

const defaultTemplateFunction = ({ question, section }: TemplateArguments) => ({
    dbPath: `${section.id}.${question.id}`
})

const doNotInclude = () => ({
    includeInApi: false
})

export const templates = {
    feature: ({ question }: TemplateArguments) => ({
        dbPath: `features.${question.id}.experience`,
        options: FEATURES_OPTIONS.map(id => ({
            id
        })),
        fieldTypeName: 'Feature',
        filterTypeName: 'FeatureExperienceFilter',
        optionTypeName: 'FeatureExperienceOption',
        enumTypeName: 'FeatureExperienceID'
    }),
    tool: ({ question }: TemplateArguments) => ({
        dbPath: `tools.${question.id}.experience`,
        options: TOOLS_OPTIONS.map(id => ({
            id
        })),
        fieldTypeName: 'Tool',
        filterTypeName: 'ToolExperienceFilter',
        optionTypeName: 'ToolExperienceOption',
        enumTypeName: 'ToolExperienceID'
    }),
    multiple: ({ question, section }: TemplateArguments) => ({
        dbPath: `${section.id}.${question.id}.choices`
    }),
    single: ({ question, section }: TemplateArguments) => ({
        dbPath: `${section.id}.${question.id}.choices`
    }),
    others: ({ question, section }: TemplateArguments) => ({
        dbPath: `${section.id}.${question.id.replace('_others', '.others')}.normalized`
    }),
    happiness: ({ question, section }: TemplateArguments) => ({
        dbPath: `${section.id}.${question.id.replace('_happiness', '.happiness')}`
    }),
    project: ({ question, section }: TemplateArguments) => ({
        dbPath: `${section.id}.${question.id.replace('_prenormalized', '.others')}.normalized`
    }),

    opinion: defaultTemplateFunction,
    bracket: defaultTemplateFunction,
    text: defaultTemplateFunction,
    longtext: defaultTemplateFunction,
    slider: defaultTemplateFunction,
    race_ethnicity: defaultTemplateFunction,
    country: defaultTemplateFunction,
    top_n: defaultTemplateFunction,

    locale: () => ({ id: 'locale' }),
    source: () => ({ id: 'source' }),
    completion_stats: () => ({ id: 'completion_stats' }),

    tools_arrows: () => ({ id: 'tools_arrows' }),
    tier_list: () => ({ id: 'tier_list' }),
    scatterplot_overview: () => ({ id: 'scatterplot_overview' }),

    features_overview: () => ({ id: 'features_overview' }),
    knowledge_score: () => ({ id: 'knowledge_score' }),

    tools_experience_linechart: ({ section }: TemplateArguments) => ({
        id: `${section.id}_tools_experience_linechart`
    }),
    tools_experience_ranking: ({ section }: TemplateArguments) => ({
        id: `${section.id}_tools_experience_ranking`
    }),
    tools_section_streams: ({ section }: TemplateArguments) => ({
        id: `${section.id}_tools_section_streams`
    }),
    tools_experience_marimekko: ({ section }: TemplateArguments) => ({
        id: `${section.id}_tools_experience_marimekko`
    }),

    email2: doNotInclude,
    receive_notifications: doNotInclude,
    help: doNotInclude

    // resources: {
    //   dbPath:(id:string) => `resources.${id}.${getSuffix(id)}`
    // },
    // usage: {
    //   dbPath:(id:string) => `usage.${id}.${getSuffix(id)}`
    // },
    // opinions: {
    //   dbPath:(id:string) => `opinions.${id}.${getSuffix(id)}`
    // }
}
