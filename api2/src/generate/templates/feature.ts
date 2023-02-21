import { TemplateArguments } from '../types'
import { FEATURES_OPTIONS } from '../../constants'

export const feature = ({ question }: TemplateArguments) => ({
    dbPath: `features.${question.id}.experience`,
    options: FEATURES_OPTIONS.map(id => ({
        id
    })),
    fieldTypeName: 'Feature',
    filterTypeName: 'FeatureExperienceFilter',
    optionTypeName: 'FeatureExperienceOption',
    enumTypeName: 'FeatureExperienceID'
})
