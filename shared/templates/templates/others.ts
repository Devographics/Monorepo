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
        [DbPathsEnum.OTHERS]: `${sectionSegment}__${questionSegment}__${DbSuffixes.OTHERS}`,
        [DbPathsEnum.SKIP]: `${sectionSegment}__${questionSegment}__${DbPathsEnum.SKIP}`,
        [DbPathsEnum.COMMENT]: `${sectionSegment}__${questionSegment}__${DbPathsEnum.COMMENT}`
    }

    const basePath = `${sectionSegment}.${questionSegment}`

    const normPaths: DbPaths = {
        [DbPathsEnum.BASE]: basePath,
        [DbPathsEnum.RAW]: `${basePath}.${DbSuffixes.RAW}`,
        [DbPathsEnum.METADATA]: `${basePath}.${DbSuffixes.METADATA}`,
        [DbPathsEnum.ERROR]: `${basePath}.${DbSuffixes.ERROR}`,
        [DbPathsEnum.OTHERS]: `${basePath}.${DbSuffixes.NORMALIZED}`,
        [DbPathsEnum.SKIP]: `${basePath}.${DbPathsEnum.SKIP}`,
        [DbPathsEnum.COMMENT]: `${basePath}.${DbPathsEnum.COMMENT}`
    }

    const output: QuestionTemplateOutput = {
        rawPaths,
        normPaths,
        ...question
    }
    return output
}
