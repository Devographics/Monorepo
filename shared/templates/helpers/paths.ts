import { Survey, Edition, Section, Question, DbPaths, DbSuffixes } from '@devographics/types'

export const getRawPaths = (
    {
        survey,
        edition,
        section,
        question
    }: {
        survey: Survey
        edition: Edition
        section: Section
        question: Question
    },
    suffix?: string
) => {
    const sectionPathSegment = section.slug || section.id
    const pathSegments = [edition.id, sectionPathSegment, question.id]
    const separator = '__'

    const getPath = (suffix?: string) =>
        suffix ? [...pathSegments, suffix].join(separator) : [...pathSegments].join(separator)

    const paths = {
        response: getPath(suffix)
    } as DbPaths

    if (question.allowOther) {
        paths.other = getPath(DbSuffixes.OTHERS)
    }
    if (question.allowPrenormalized) {
        paths.other = getPath(DbSuffixes.PRENORMALIZED)
    }
    if (question.allowComment) {
        paths.comment = getPath(DbSuffixes.COMMENT)
    }
    return paths
}

const separator = '.'

const getPath = (pathSegments: string[]) => pathSegments.join(separator)

export const getNormPaths = (
    {
        survey,
        edition,
        section,
        question
    }: {
        survey: Survey
        edition: Edition
        section: Section
        question: Question
    },
    suffix?: string
) => {
    const sectionSegment = section.slug || section.id
    const questionSegment = question.id as string
    const basePathSegments = [sectionSegment, questionSegment]

    let paths = {
        response: getPath(suffix ? [...basePathSegments, suffix] : basePathSegments)
    } as DbPaths

    if (question.allowOther || question.allowPrenormalized) {
        paths = {
            ...paths,
            other: getPath([...basePathSegments, DbSuffixes.OTHERS, DbSuffixes.NORMALIZED]),
            raw: getPath([...basePathSegments, DbSuffixes.OTHERS, DbSuffixes.RAW]),
            patterns: getPath([...basePathSegments, DbSuffixes.OTHERS, DbSuffixes.PATTERNS]),
            error: getPath([...basePathSegments, DbSuffixes.OTHERS, DbSuffixes.ERROR])
        }
    }

    if (question.allowComment) {
        paths.comment = getPath([...basePathSegments, DbSuffixes.COMMENT])
    }
    return paths
}

export const getPaths = (
    options: {
        survey: Survey
        edition: Edition
        section: Section
        question: Question
    },
    suffix?: string
) => ({
    rawPaths: getRawPaths(options, suffix),
    normPaths: getNormPaths(options, suffix)
})
