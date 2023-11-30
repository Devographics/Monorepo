import {
    DbSuffixes,
    QuestionTemplateOutput,
    DbPaths,
    TemplateFunction,
    DbPathsEnum
} from '@devographics/types'
import { checkHasId } from '../helpers'

export const others: TemplateFunction = options => {
    const { edition, section } = options
    const question = checkHasId(options)

    const sectionSegment = section.template === 'tool' ? 'tools_others' : section.slug || section.id
    const questionSegment = question.id?.replace('_others', '')

    const basePath = `${sectionSegment}.${questionSegment}.${DbSuffixes.OTHERS}`

    const rawPaths: DbPaths = {
        other: `${sectionSegment}__${questionSegment}__${DbSuffixes.OTHERS}`,
        skip: `${sectionSegment}__${questionSegment}__${DbPathsEnum.SKIP}`
    }

    const normPaths: DbPaths = {
        base: basePath,
        raw: `${basePath}.${DbSuffixes.RAW}`,
        metadata: `${basePath}.${DbSuffixes.METADATA}`,
        error: `${basePath}.${DbSuffixes.ERROR}`,
        other: `${basePath}.${DbSuffixes.NORMALIZED}`,
        skip: `${basePath}.${DbPathsEnum.SKIP}`
    }

    const output: QuestionTemplateOutput = {
        rawPaths,
        normPaths,
        ...question
    }
    return output
}
