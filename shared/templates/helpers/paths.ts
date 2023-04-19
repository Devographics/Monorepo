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
    const sectionPathSegment = section.slug || section.id
    const pathSegments = [sectionPathSegment, question.id]
    const separator = '.'

    const getPath = (suffix?: string) =>
        suffix ? [...pathSegments, suffix].join(separator) : pathSegments.join(separator)

    const paths = {
        response: getPath(suffix)
    } as DbPaths

    if (question.allowOther || question.allowPrenormalized) {
        paths.other = getPath(`${DbSuffixes.OTHERS}.${DbSuffixes.NORMALIZED}`)
    }

    if (question.allowComment) {
        paths.comment = getPath(DbSuffixes.COMMENT)
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
