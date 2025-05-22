import './FreeformAnswers.scss'
import React from 'react'
import T from 'core/i18n/T'
import { WordCount } from '@devographics/types'
import take from 'lodash/take'

export const ALPHA = 'alphabetical'
export const LENGTH = 'length'

export const KEYWORD_COUNT = 25

export const KeywordFilter = ({
    keywordFilter,
    setKeywordFilter,
    items,
    stats
}: {
    keywordFilter: FreeformAnswersState['filter']
    setKeywordFilter: FreeformAnswersState['setFilter']
    items: any[]
    stats: WordCount[]
}) => {
    return (
        <div className="keyword-filter">
            <div className="keyword-frequencies">
                {take(stats, KEYWORD_COUNT).map(keyword => (
                    <button
                        key={keyword.word}
                        onClick={e => {
                            e.preventDefault()
                            setKeywordFilter(keyword.word)
                        }}
                    >
                        {keyword.word} ({keyword.count})
                    </button>
                ))}
            </div>
            <h4>
                <T k="answers.keyword" />
            </h4>
            <input
                type="text"
                value={keywordFilter || ''}
                onChange={e => {
                    setKeywordFilter(e.target.value)
                }}
            />
            <T k="answers.keyword_count" values={{ count: items.length }} />
        </div>
    )
}
