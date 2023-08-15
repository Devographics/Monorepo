import { DbPaths, DbSuffixes, QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

export const referrer: TemplateFunction = ({ survey, edition, question, section }) => {
    const rawPaths: DbPaths = {
        other: `common__user_info__referrer`
    }

    const basePath = `user_info.referrer`
    const normPaths: DbPaths = {
        base: basePath,
        raw: `${basePath}.${DbSuffixes.RAW}`,
        patterns: `${basePath}.${DbSuffixes.PATTERNS}`,
        error: `${basePath}.${DbSuffixes.ERROR}`,
        other: `${basePath}.${DbSuffixes.NORMALIZED}`
    }

    const output: QuestionTemplateOutput = {
        id: 'referrer',
        rawPaths,
        normPaths,
        ...question
    }

    return output
}
