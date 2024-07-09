import {
    DbSuffixes,
    QuestionTemplateOutput,
    DbPaths,
    TemplateFunction,
    DbPathsEnum
} from '@devographics/types'
import { checkHasId, isToolTemplate } from '../helpers'

export const others: TemplateFunction = options => {
    const { edition, section } = options
    const question = checkHasId(options)

    const sectionSegment = section.slug || section.id
    const questionSegment = question.id

    const rawPaths: DbPaths = {
        other: `${sectionSegment}__${questionSegment}__${DbSuffixes.OTHERS}`,
        skip: `${sectionSegment}__${questionSegment}__${DbPathsEnum.SKIP}`
    }

    const basePath = `${sectionSegment}.${questionSegment}`

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
