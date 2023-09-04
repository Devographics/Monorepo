import {
    DbPaths,
    DbPathsEnum,
    DbSuffixes,
    QuestionTemplateOutput,
    TemplateFunction
} from '@devographics/types'
import { checkHasId } from '../helpers'

export const text: TemplateFunction = options => {
    const { edition, section } = options
    const question = checkHasId(options)

    const sectionSegment = section.template === 'tool' ? 'tools_others' : section.slug || section.id
    const questionSegment = question.id

    // TODO: currently surveyform looks in "response" for all fields,
    // but surveyadmin looks in "other", "prenormalize", etc. for different fields
    const rawPaths: DbPaths = {
        [DbPathsEnum.RESPONSE]: `${sectionSegment}__${questionSegment}`,
        [DbPathsEnum.OTHER]: `${sectionSegment}__${questionSegment}`
    }

    const basePath = `${sectionSegment}.${questionSegment}`
    const normPaths: DbPaths = {
        [DbPathsEnum.BASE]: basePath,
        [DbPathsEnum.RAW]: `${basePath}.${DbSuffixes.RAW}`,
        [DbPathsEnum.PATTERNS]: `${basePath}.${DbSuffixes.PATTERNS}`,
        [DbPathsEnum.ERROR]: `${basePath}.${DbSuffixes.ERROR}`,
        [DbPathsEnum.OTHER]: `${basePath}.${DbSuffixes.NORMALIZED}`
    }

    const output: QuestionTemplateOutput = {
        rawPaths,
        normPaths,
        ...question
    }
    return output
}
