import {
    Survey,
    Edition,
    Section,
    Question,
    EditionMetadata,
    QuestionMetadata,
    DbPaths,
    DbSuffixes,
    QuestionTemplateOutput,
    DbPathsEnum,
    DbPathsStrings,
    DbSubPaths
} from '@devographics/types'

export const prefixWithEditionId = (s: string, editionId: string) => {
    // note: fields starting with `common` don't need to be prefixed with the edition id
    return s.slice(0, 8) === 'common__' ? s : `${editionId}__${s}`
}

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
    suffix?: string,
    subPaths?: string[]
) => {
    const sectionPathSegment = question.sectionId || section.slug || section.id
    const pathSegments = [sectionPathSegment, question.id]
    const separator = '__'

    const getPath = (extraSegments: Array<string | number> = []) =>
        suffix
            ? [...pathSegments, ...extraSegments].join(separator)
            : [...pathSegments].join(separator)

    const paths = {
        response: getPath(suffix ? [suffix] : [])
    } as DbPaths

    if (question.allowOther) {
        paths.other = getPath([DbSuffixes.OTHERS])
    }
    if (question.allowPrenormalized) {
        paths.other = getPath([DbSuffixes.PRENORMALIZED])
    }
    if (question.allowComment) {
        paths[DbSuffixes.COMMENT] = getPath([DbSuffixes.COMMENT])
    }

    // note: for now we only support follow-ups with questions that have options
    if (question.options && question.followups) {
        const options = question.options

        const getOptionsPaths = (suffix: string) =>
            Object.fromEntries(
                options.map(option => {
                    const optionPath = getPath([option?.id, suffix])
                    return [option.id, optionPath]
                })
            )

        paths[DbSuffixes.FOLLOWUP_PREDEFINED] = getOptionsPaths(DbSuffixes.FOLLOWUP_PREDEFINED)
        paths[DbSuffixes.FOLLOWUP_FREEFORM] = getOptionsPaths(DbSuffixes.FOLLOWUP_FREEFORM)
    }

    if (subPaths) {
        paths[DbPathsEnum.SUBPATHS] = {}
        subPaths.forEach(subPath => {
            const s = paths[DbPathsEnum.SUBPATHS] as DbSubPaths
            s[subPath] = getPath([subPath])
        })
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
    suffix?: string,
    subPaths?: string[]
) => {
    const sectionSegment = question.sectionId || section.slug || section.id
    const questionSegment = question.id as string
    const basePathSegments = [sectionSegment, questionSegment]

    const separator = '.'

    const getPath = (pathSegments: Array<string | number>) => pathSegments.join(separator)

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

    if (question.options && question.followups) {
        const options = question.options

        const getOptionsPaths = (suffix: string) =>
            Object.fromEntries(
                options.map(option => {
                    const optionPath = getPath([...basePathSegments, option?.id, suffix])
                    return [option.id, optionPath]
                })
            )

        paths[DbSuffixes.FOLLOWUP_PREDEFINED] = getOptionsPaths(DbSuffixes.FOLLOWUP_PREDEFINED)
        paths[DbSuffixes.FOLLOWUP_FREEFORM] = getOptionsPaths(DbSuffixes.FOLLOWUP_FREEFORM)
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
    suffix?: string,
    subPaths?: string[]
) => ({
    rawPaths: getRawPaths(options, suffix, subPaths),
    normPaths: getNormPaths(options, suffix, subPaths)
})

/*

Note: we currently need to prefix all paths with the edition id

TODO: In the future, get rid of this prefix, and replace formPaths with rawPaths?

*/

const prefixPathsObjectWithEditionId = (paths: DbSubPaths, editionId: string) => {
    const prefixedPaths = {} as DbSubPaths
    for (const key in paths) {
        const path = paths[key]
        prefixedPaths[key] = prefixWithEditionId(path, editionId)
    }
    return prefixedPaths
}

export const getFormPaths = ({
    edition,
    question
}: {
    edition: EditionMetadata
    question: QuestionMetadata | QuestionTemplateOutput
}): DbPaths => {
    const paths = {} as DbPaths
    if (question.rawPaths) {
        const allPathKeys = Object.keys(question.rawPaths) as DbPathsEnum[]
        const stringPathsKeys = allPathKeys.filter(
            k =>
                ![
                    DbPathsEnum.FOLLOWUP_FREEFORM,
                    DbPathsEnum.FOLLOWUP_PREDEFINED,
                    DbPathsEnum.SUBPATHS
                ].includes(k)
        ) as Array<keyof DbPathsStrings>
        stringPathsKeys.forEach(key => {
            const path = question?.rawPaths?.[key]
            if (path) {
                paths[key] = prefixWithEditionId(path, edition.id)
            }
        })
        // handle follow-up paths and subPaths separately
        if (question.rawPaths[DbPathsEnum.FOLLOWUP_FREEFORM]) {
            paths[DbPathsEnum.FOLLOWUP_FREEFORM] = prefixPathsObjectWithEditionId(
                question.rawPaths[DbPathsEnum.FOLLOWUP_FREEFORM],
                edition.id
            )
        }
        if (question.rawPaths[DbPathsEnum.FOLLOWUP_PREDEFINED]) {
            paths[DbPathsEnum.FOLLOWUP_PREDEFINED] = prefixPathsObjectWithEditionId(
                question.rawPaths[DbPathsEnum.FOLLOWUP_PREDEFINED],
                edition.id
            )
        }
        if (question.rawPaths[DbPathsEnum.SUBPATHS]) {
            paths[DbPathsEnum.SUBPATHS] = prefixPathsObjectWithEditionId(
                question.rawPaths[DbPathsEnum.SUBPATHS],
                edition.id
            )
        }
    }
    return paths
}
