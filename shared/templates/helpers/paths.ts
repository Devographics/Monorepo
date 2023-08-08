import {
    Survey,
    Edition,
    Section,
    Question,
    EditionMetadata,
    QuestionMetadata,
    DbPaths,
    DbSuffixes,
    QuestionTemplateOutput
} from '@devographics/types'

export const getRawPaths = (
    {
        survey,
        section,
        question
    }: {
        survey: Survey
        section: Section
        question: Question
    },
    suffix?: string
) => {
    const sectionPathSegment = section.slug || section.id
    const pathSegments = [sectionPathSegment, question.id]
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
        paths[DbSuffixes.COMMENT] = getPath(DbSuffixes.COMMENT)
    }
<<<<<<< Updated upstream
=======
    if (question.followups) {
        paths[DbSuffixes.FOLLOWUP_PREDEFINED] = getPath(DbSuffixes.FOLLOWUP_PREDEFINED)
        paths[DbSuffixes.FOLLOWUP_FREEFORM] = getPath(DbSuffixes.FOLLOWUP_FREEFORM)
    }
>>>>>>> Stashed changes
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
        base: getPath(basePathSegments),
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
<<<<<<< Updated upstream
=======

    if (question.followups) {
        paths[DbSuffixes.FOLLOWUP_PREDEFINED] = getPath([
            ...basePathSegments,
            DbSuffixes.FOLLOWUP_PREDEFINED
        ])
        paths[DbSuffixes.FOLLOWUP_FREEFORM] = getPath([
            ...basePathSegments,
            DbSuffixes.FOLLOWUP_FREEFORM
        ])
    }
>>>>>>> Stashed changes
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

/*

Note: we currently need to prefix all paths with the edition id

TODO: In the future, get rid of this prefix, and replace formPaths with rawPaths?

*/
export const getFormPaths = ({
    edition,
    question
}: {
    edition: EditionMetadata
    question: QuestionMetadata | QuestionTemplateOutput
}): DbPaths => {
    const paths: { [key in keyof DbPaths]: string } = {}
    if (question.rawPaths) {
        ;(Object.keys(question.rawPaths) as Array<keyof DbPaths>).forEach(key => {
            const path = question?.rawPaths?.[key]
            if (path) {
                paths[key] = `${edition.id}__${path}`
            }
        })
    }
    return paths
}
