import {
    DbPaths,
    DbPathsEnum,
    DbSuffixes,
    QuestionTemplateOutput,
    TemplateFunction
} from '@devographics/types'
import { checkHasId, isToolTemplate } from '../helpers'

export const text: TemplateFunction = options => {
    const { edition, section } = options
    const question = checkHasId(options)

    const sectionSegment = section.slug || section.id
    const questionSegment = question.id

    // TODO: currently surveyform looks in "response" for all fields,
    // but surveyadmin looks in "other", "prenormalize", etc. for different fields
    const rawPaths: DbPaths = {
        [DbPathsEnum.RESPONSE]: `${sectionSegment}__${questionSegment}`,
        [DbPathsEnum.OTHER]: `${sectionSegment}__${questionSegment}`,
        [DbPathsEnum.SKIP]: `${sectionSegment}__${questionSegment}__${DbPathsEnum.SKIP}`,
        [DbPathsEnum.COMMENT]: `${sectionSegment}__${questionSegment}__${DbPathsEnum.COMMENT}`
    }

    const basePath = `${sectionSegment}.${questionSegment}`
    const normPaths: DbPaths = {
        [DbPathsEnum.BASE]: basePath,
        [DbPathsEnum.RAW]: `${basePath}.${DbSuffixes.RAW}`,
        [DbPathsEnum.METADATA]: `${basePath}.${DbSuffixes.METADATA}`,
        [DbPathsEnum.ERROR]: `${basePath}.${DbSuffixes.ERROR}`,
        // TODO: watch out for issue where same path will be queried twice
        // when using COMBINED mode
        [DbPathsEnum.RESPONSE]: `${basePath}.${DbSuffixes.NORMALIZED}`,
        [DbPathsEnum.OTHER]: `${basePath}.${DbSuffixes.NORMALIZED}`,
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
