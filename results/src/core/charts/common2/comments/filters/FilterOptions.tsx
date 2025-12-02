import React from 'react'
import { Comment, QuestionMetadata } from '@devographics/types'
import { useI18n } from '@devographics/react-i18n'
import { getItemLabel } from 'core/helpers/labels'
import { filterCommentsByValue } from '../Comments'
import { CommentsFiltersState } from '../types'
import { FilterItem } from '../FilterItem'
import { FilterSection } from '../CommentsFilters'

export const FilterOptions = ({
    question,
    allComments,
    stateStuff
}: {
    question: QuestionMetadata
    allComments: Comment[]
    stateStuff: CommentsFiltersState
}) => {
    const { valueFilter, setValueFilter } = stateStuff
    const { getString } = useI18n()

    const { options } = question

    if (!options) {
        return null
    }

    return (
        <FilterSection
            headingId="answer"
            showClear={valueFilter !== null}
            onClear={() => {
                setValueFilter(null)
            }}
        >
            <>
                {options.map(option => {
                    const { id, entity } = option
                    const { shortLabel } = getItemLabel({
                        id,
                        entity,
                        getString,
                        i18nNamespace: question.id
                    })
                    const count = filterCommentsByValue(allComments, option.id).length
                    return (
                        <FilterItem
                            key={option.id}
                            question={question}
                            id={option.id}
                            label={shortLabel}
                            count={count}
                            isActive={option.id === valueFilter}
                            clickHandler={() => {
                                setValueFilter(id)
                            }}
                        />
                    )
                })}
            </>
        </FilterSection>
    )
}
