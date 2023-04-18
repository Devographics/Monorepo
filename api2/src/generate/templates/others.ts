import { DbSuffixes } from '@devographics/types'
import { ApiTemplateFunction } from '../../types/surveys'

export const others: ApiTemplateFunction = ({ edition, question, section }) => {
    const questionSegment = question.id?.replace('_others', '')
    return {
        id: 'placeholder',
        // dbSuffix: 'others.normalized',
        // isNormalized: true,
        // dbPath: `${section.slug || section.id}.${question?.id?.replace(
        //     '_others',
        //     '.others'
        // )}.normalized`
        rawPaths: {
            response: `${edition.id}__${section.slug || section.id}__${questionSegment}__${
                DbSuffixes.OTHERS
            }`
        },
        normPaths: {
            response: `${section.slug || section.id}.${questionSegment}.${DbSuffixes.OTHERS}.${
                DbSuffixes.NORMALIZED
            }`
        },
        ...question
    }
}
