import React, { useState } from 'react'
import { Comment, WordCount, OrderOptions } from '@devographics/types'
import './Comments.scss'
import { CommentsFilters } from './CommentsFilters'
import { CommentItem } from './CommentsItem'
import sortBy from 'lodash/sortBy'
import { CommentsCommonProps, CommentsFiltersState } from './types'
import { ALPHA, LENGTH } from './constants'
import BlockQuestion from 'core/blocks/block/BlockQuestion'
import T from 'core/i18n/T'
import { getQuestionLabel } from '../helpers/labels'
import { useI18n } from '@devographics/react-i18n'

export const filterCommentsByValue = (comments: Comment[], value: string | number | null) =>
    value === ''
        ? comments
        : comments.filter(c =>
              Array.isArray(c.responseValue)
                  ? c.responseValue.map(String).includes(String(value))
                  : String(c.responseValue) === String(value)
          )

export const filterCommentsByExperience = (comments: Comment[], value: string | number | null) =>
    value === '' ? comments : comments.filter(c => String(c.experience) === String(value))

export const filterCommentsBySentiment = (comments: Comment[], value: string | number | null) =>
    value === '' ? comments : comments.filter(c => String(c.sentiment) === String(value))

export function matchWordStart(text: string, word: string): boolean {
    const regex = new RegExp(`\\b${escapeRegExp(word)}`, 'i')
    return regex.test(text)
}

export function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape regex chars
}

const filterComments = (comments: Comment[], stateStuff: CommentsFiltersState) => {
    const {
        experienceFilter,
        sentimentFilter,
        valueFilter,
        searchFilter,
        sort,
        order,
        keywordFilter
    } = stateStuff

    let filteredComments = [...comments]

    if (experienceFilter) {
        filteredComments = filterCommentsByExperience(filteredComments, experienceFilter)
    }
    if (sentimentFilter) {
        filteredComments = filterCommentsBySentiment(filteredComments, sentimentFilter)
    }
    if (valueFilter) {
        filteredComments = filterCommentsByValue(filteredComments, valueFilter)
    }
    if (sort === LENGTH) {
        filteredComments = sortBy(filteredComments, comment => comment.messageHtml.length)
    } else if (sort === ALPHA) {
        filteredComments = sortBy(filteredComments, comment => comment.messageHtml.toLowerCase())
    }
    if (order && order === OrderOptions.DESC) {
        filteredComments = filteredComments.toReversed()
    }

    if (keywordFilter) {
        filteredComments = filteredComments.filter(comment =>
            matchWordStart(comment.messageHtml, keywordFilter)
        )
    }
    if (searchFilter) {
        filteredComments = filteredComments.filter(comment =>
            matchWordStart(comment.messageHtml, searchFilter)
        )
    }
    return filteredComments
}

export const Comments = ({
    comments,
    stats,
    block,
    question,
    sectionId
}: {
    comments: Comment[]
    stats: WordCount[]
    sectionId: string
} & CommentsCommonProps) => {
    const { getString } = useI18n()

    const i18nNamespace = block.i18nNamespace || sectionId

    const label = getQuestionLabel({ question, getString, i18nNamespace, block })

    const [experienceFilter, setExperienceFilter] =
        useState<CommentsFiltersState['experienceFilter']>(null)
    const [sentimentFilter, setSentimentFilter] =
        useState<CommentsFiltersState['sentimentFilter']>(null)
    const [valueFilter, setValueFilter] = useState<CommentsFiltersState['valueFilter']>(null)
    const [sort, setSort] = useState<CommentsFiltersState['sort']>(null)
    const [order, setOrder] = useState<CommentsFiltersState['order']>(null)
    const [keywordFilter, setKeywordFilter] = useState<CommentsFiltersState['keywordFilter']>(null)
    const [searchFilter, setSearchFilter] = useState<CommentsFiltersState['searchFilter']>(null)

    const stateStuff: CommentsFiltersState = {
        experienceFilter,
        setExperienceFilter,
        sentimentFilter,
        setSentimentFilter,
        valueFilter,
        setValueFilter,
        searchFilter,
        setSearchFilter,
        sort,
        setSort,
        order,
        setOrder,
        keywordFilter,
        setKeywordFilter
    }

    const filteredComments = filterComments(comments, stateStuff)

    return (
        <>
            {/* <pre>
                <code>{JSON.stringify(stateStuff, null, 2)}</code>
            </pre> */}
            <div className="comments-heading">
                <div className="comments-heading-top">
                    <h3>
                        <T k="comments.comments_for" values={{ name: label.label }} />
                    </h3>
                    <div className="comments-count">
                        <span className="comments-count-current">{filteredComments.length}</span>/
                        <span className="comments-count-all">{comments.length}</span>
                    </div>
                </div>
                <BlockQuestion block={block} question={question} />
            </div>

            <div className="comments-contents">
                <CommentsFilters
                    comments={filteredComments}
                    allComments={comments}
                    question={question}
                    stateStuff={stateStuff}
                    stats={stats}
                />
                <div className="comments-list">
                    {filteredComments?.map((comment, i) => (
                        <CommentItem
                            key={i}
                            index={i}
                            {...comment}
                            question={question}
                            stateStuff={stateStuff}
                            questionLabel={label?.label}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}
