import './FreeformAnswers.scss'
import React, { useState } from 'react'
import {
    RawDataAnswer,
    WordCount,
    Bucket,
    Entity,
    TokenWithCount,
    OrderOptions
} from '@devographics/types'
import sortBy from 'lodash/sortBy'
import { FilterKeywords } from '../comments/filters/FilterKeywords'
import { ALPHA, LENGTH } from '../comments/constants'
import { FreeformAnswersState } from './types'
import { FreeformAnswerItem } from './FreeformAnswersItem'
import { FilterSearch } from '../comments/filters/FilterSearch'
import BlockQuestion from 'core/blocks/block/BlockQuestion'
import T from 'core/i18n/T'
import { CommentsCommonProps } from '../comments/types'
import { matchWordStart } from '../comments/Comments'
import { FilterTokens } from '../comments/filters/FilterTokens'

export const FreeformAnswers = ({
    answers,
    questionLabel,
    tokenId,
    tokenLabel,
    block,
    question,
    buckets,
    stats,
    entities,
    tokens,
    defaultTokenFilter
}: {
    answers: RawDataAnswer[]
    questionLabel: string
    tokenId: string
    tokenLabel: string
    stats: WordCount[]
    buckets: Bucket[]
    entities: Entity[]
    tokens: TokenWithCount[]
    defaultTokenFilter?: string
} & CommentsCommonProps) => {
    const [keywordFilter, setKeywordFilter] = useState<FreeformAnswersState['keywordFilter']>(null)
    const [tokenFilter, setTokenFilter] = useState<FreeformAnswersState['tokenFilter']>(
        defaultTokenFilter || null
    )
    const [searchFilter, setSearchFilter] = useState<FreeformAnswersState['searchFilter']>(null)
    const [sort, setSort] = useState<FreeformAnswersState['sort']>(null)
    const [order, setOrder] = useState<FreeformAnswersState['order']>(null)

    const stateStuff: FreeformAnswersState = {
        keywordFilter,
        setKeywordFilter,
        tokenFilter,
        setTokenFilter,
        sort,
        setSort,
        order,
        setOrder,
        searchFilter,
        setSearchFilter
    }
    let filteredAnswers = answers
    if (sort === LENGTH) {
        filteredAnswers = sortBy(filteredAnswers, a => a.raw.length)
    } else if (sort === ALPHA) {
        filteredAnswers = sortBy(filteredAnswers, a => a.raw.toLowerCase())
    }

    if (order && order === OrderOptions.DESC) {
        filteredAnswers = filteredAnswers.toReversed()
    }
    if (searchFilter) {
        filteredAnswers = filteredAnswers.filter(answer =>
            matchWordStart(answer.rawHtml, searchFilter)
        )
    }
    if (keywordFilter) {
        filteredAnswers = filteredAnswers.filter(answer =>
            matchWordStart(answer.rawHtml, keywordFilter)
        )
    }
    if (tokenFilter) {
        filteredAnswers = filteredAnswers.filter(answer =>
            answer?.tokens?.map(t => t.id).includes(tokenFilter)
        )
    }
    return (
        <>
            <div className="comments-heading">
                <div className="comments-heading-top">
                    <h3>
                        <T k="answers.answers_for" values={{ name: tokenLabel }} md={true} />
                    </h3>
                    <div className="comments-count">
                        <span className="comments-count-current">{filteredAnswers.length}</span>/
                        <span className="comments-count-all">{answers.length}</span>
                    </div>
                </div>
                <BlockQuestion block={block} question={question} />
            </div>

            <div className="comments-contents">
                <div className={`comments-filters-wrapper comments-filters-wrapper-show`}>
                    <div className="comments-filters">
                        <FilterTokens
                            tokenId={tokenId}
                            stateStuff={stateStuff}
                            buckets={buckets}
                            entities={entities}
                            allTokens={tokens}
                            question={question}
                        />
                        <FilterSearch stateStuff={stateStuff} />
                        {stats?.length > 0 && (
                            <FilterKeywords
                                stateStuff={stateStuff}
                                stats={stats}
                                question={question}
                            />
                        )}
                    </div>
                </div>

                <div className="comments-list">
                    {filteredAnswers?.map((answer, i) => (
                        <FreeformAnswerItem
                            key={i}
                            index={i}
                            {...answer}
                            questionLabel={questionLabel}
                            tokenId={tokenId}
                            tokenLabel={tokenLabel}
                            stateStuff={stateStuff}
                            buckets={buckets}
                            allTokens={tokens}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}
