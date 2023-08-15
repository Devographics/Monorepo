import { DbPaths, DbSuffixes, QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

export const sourcetag: TemplateFunction = ({ survey, edition, question, section }) => {
    const rawPaths: DbPaths = {
        other: `common__user_info__source`
    }

    const basePath = `user_info.sourcetag`
    const normPaths: DbPaths = {
        base: basePath,
        raw: `${basePath}.${DbSuffixes.RAW}`,
        patterns: `${basePath}.${DbSuffixes.PATTERNS}`,
        error: `${basePath}.${DbSuffixes.ERROR}`,
        other: `${basePath}.${DbSuffixes.NORMALIZED}`
    }

    const output: QuestionTemplateOutput = {
        id: 'sourcetag',
        rawPaths,
        normPaths,
        ...question
    }

    return output
}
