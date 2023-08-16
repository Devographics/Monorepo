import { DbPaths, QuestionTemplateOutput, TemplateFunction, DbSuffixes } from '@devographics/types'
import { checkHasId } from '../helpers'

export const projects: TemplateFunction = options => {
    const { edition, section } = options
    const question = checkHasId(options)

    const sectionSegment = section.template === 'tool' ? 'tools_others' : section.slug || section.id
    const questionSegment = question?.id?.replace('_prenormalized', '').replace('_others', '')

    const basePath = `${sectionSegment}.${questionSegment}.${DbSuffixes.OTHERS}`

    const rawPaths: DbPaths = {
        response: `${sectionSegment}__${questionSegment}__${DbSuffixes.PRENORMALIZED}`
    }

    const normPaths: DbPaths = {
        base: basePath,
        raw: `${basePath}.${DbSuffixes.RAW}`,
        patterns: `${basePath}.${DbSuffixes.PATTERNS}`,
        error: `${basePath}.${DbSuffixes.ERROR}`,
        prenormalized: `${basePath}.${DbSuffixes.NORMALIZED}`
    }

    const output: QuestionTemplateOutput = {
        rawPaths,
        normPaths,
        allowMultiple: true,
        ...question
    }
    return output
}
