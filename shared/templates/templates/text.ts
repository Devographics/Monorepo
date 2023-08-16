import { DbPaths, DbSuffixes, QuestionTemplateOutput, TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

export const text: TemplateFunction = options => {
    const { edition, section } = options
    const question = checkHasId(options)

    const sectionSegment = section.template === 'tool' ? 'tools_others' : section.slug || section.id
    const questionSegment = question.id

    const rawPaths: DbPaths = {
        response: `${sectionSegment}__${questionSegment}`
    }

    const basePath = `${sectionSegment}.${questionSegment}`
    const normPaths: DbPaths = {
        base: basePath,
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
