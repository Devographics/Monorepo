import React, { useState } from 'react'
import {
    Comment,
    FeaturesOptions,
    SimplifiedSentimentOptions,
    WordCount
} from '@devographics/types'
import './Comments.scss'
import { CommentsFilters } from './CommentsFilters'
import { CommentItem } from './CommentsItem'
import { OrderOptions } from '../types'
import sortBy from 'lodash/sortBy'
import { CommentsCommonProps, CommentsFiltersState } from './types'
import { ALPHA, LENGTH } from './constants'

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

export const Comments = ({
    comments,
    stats,
    name,
    question
}: {
    comments: Comment[]
    stats: WordCount[]
} & CommentsCommonProps) => {
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

    let filteredComments = comments

    filteredComments = filterCommentsByExperience(filteredComments, experienceFilter)
    filteredComments = filterCommentsBySentiment(filteredComments, sentimentFilter)
    filteredComments = filterCommentsByValue(filteredComments, valueFilter)

    if (sort === LENGTH) {
        filteredComments = sortBy(filteredComments, comment => comment.message.length)
    } else if (sort === ALPHA) {
        filteredComments = sortBy(filteredComments, comment => comment.message.toLowerCase())
    }
    if (order && order === OrderOptions.DESC) {
        filteredComments = filteredComments.toReversed()
    }

    if (keywordFilter) {
        filteredComments = filteredComments.filter(comment =>
            comment.message.toLowerCase().includes(keywordFilter.toLowerCase())
        )
    }
    if (searchFilter) {
        filteredComments = filteredComments.filter(comment =>
            comment.message.toLowerCase().includes(searchFilter.toLowerCase())
        )
    }
    return (
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
                        name={name}
                        question={question}
                        stateStuff={stateStuff}
                    />
                ))}
            </div>
        </div>
    )
}
