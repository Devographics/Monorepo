import './FreeformAnswers.scss'
import React, { useState } from 'react'
import { useI18n } from '@devographics/react-i18n'
import { RawDataItem } from '@devographics/types'
import { OrderOptions } from '../types'
import sortBy from 'lodash/sortBy'
import { FilterKeywords } from '../comments/filters/FilterKeywords'
import { OrderToggle } from '../comments/OrderToggle'
import { ALPHA, LENGTH } from '../comments/constants'
import { FreeformAnswersState } from './types'
import { FreeformAnswerItem } from './FreeformAnswersItem'

export const FreeformAnswers = ({
    answers: answers_,
    questionLabel,
    tokenLabel
}: {
    answers: RawDataItem[]
    questionLabel: string
    tokenLabel: string
}) => {
    const { getString } = useI18n()
    const [keywordFilter, setKeywordFilter] = useState<FreeformAnswersState['keywordFilter']>(null)
    const [sort, setSort] = useState<FreeformAnswersState['sort']>(null)
    const [order, setOrder] = useState<FreeformAnswersState['order']>(null)

    const labelKey = 'answers.length'

    const freeformAnswersState: FreeformAnswersState = {
        keywordFilter,
        setKeywordFilter,
        sort,
        setSort,
        order,
        setOrder
    }
    let answers = answers_
    if (sort === LENGTH) {
        answers = sortBy(answers, a => a.raw.length)
    } else if (sort === ALPHA) {
        answers = sortBy(answers, a => a.raw.toLowerCase())
    }

    if (order && order === OrderOptions.DESC) {
        answers = answers.toReversed()
    }
    if (keywordFilter) {
        answers = answers.filter(answer =>
            answer.raw.toLowerCase().includes(keywordFilter.toLowerCase())
        )
    }
    return (
        <div className="freeform-answers-list">
            <div className="freeform-answers-options">
                <FilterKeywords
                    keywordFilter={keywordFilter}
                    setKeywordFilter={setKeywordFilter}
                    items={answers}
                />
                <OrderToggle {...freeformAnswersState} />
                {/* <Toggle
                    sortOrder={order}
                    labelId="charts.sort_by"
                    handleSelect={handleSelect}
                    items={toggleItems}
                    hasDefault={true}
                /> */}
            </div>
            {answers?.map((answer, i) => (
                <FreeformAnswerItem
                    key={i}
                    index={i}
                    {...answer}
                    questionLabel={questionLabel}
                    tokenLabel={tokenLabel}
                />
            ))}
        </div>
    )
}
