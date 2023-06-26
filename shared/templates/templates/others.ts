import { DbSuffixes, QuestionTemplateOutput, DbPaths, TemplateFunction } from '@devographics/types'
import { checkHasId } from '../helpers'

export const others: TemplateFunction = options => {
    const { edition, section } = options
    const question = checkHasId(options)

    const sectionSegment = section.template === 'tool' ? 'tools_others' : section.slug || section.id
    const questionSegment = question.id?.replace('_others', '')

    const basePath = `${sectionSegment}.${questionSegment}.${DbSuffixes.OTHERS}`

    const rawPaths: DbPaths = {
        other: `${sectionSegment}__${questionSegment}__${DbSuffixes.OTHERS}`
    }

    const normPaths: DbPaths = {
        raw: `${basePath}.${DbSuffixes.RAW}`,
        patterns: `${basePath}.${DbSuffixes.PATTERNS}`,
        error: `${basePath}.${DbSuffixes.ERROR}`,
        other: `${basePath}.${DbSuffixes.NORMALIZED}`
    }

    const output: QuestionTemplateOutput = {
        rawPaths,
        normPaths,
        ...question
    }
    return output
}
