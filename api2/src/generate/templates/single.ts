import { DbSuffixes } from '@devographics/types'
import { ApiTemplateFunction } from '../../types/surveys'
import { getPaths } from '../helpers'

export const single: ApiTemplateFunction = options => {
    const { question, section } = options
    return {
        id: 'placeholder',
        // dbSuffix: 'choices'
        // dbPath: `${section.slug || section.id}.${question.id}.choices`
        ...getPaths(options, DbSuffixes.CHOICES),
        ...question
    }
}
