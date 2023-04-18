import { ApiTemplateFunction } from '../../types/surveys'
import { DbSuffixes } from '@devographics/types'

export const project: ApiTemplateFunction = ({ edition, question, section }) => {
    const sectionSegment = section.template === 'tool' ? 'tools_others' : section.slug || section.id
    const questionSegment = question?.id?.replace('_prenormalized', '')

    // const dbPath = `${rootSegment}.${questionId}.normalized`

    return {
        id: 'placeholder',
        // dbSuffix: 'prenormalized',
        // isNormalized: true,
        // dbPath,
        rawPaths: {
            response: `${edition.id}__${sectionSegment}__${questionSegment}__${DbSuffixes.PRENORMALIZED}`
        },
        normPaths: {
            response: `${sectionSegment}.${questionSegment}.${DbSuffixes.OTHERS}.${DbSuffixes.NORMALIZED}`
        },
        ...question
    }
}
