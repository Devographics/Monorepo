import React from 'react'
import { Bucket, Entity, TokenWithCount, QuestionMetadata } from '@devographics/types'
import { useI18n } from '@devographics/react-i18n'
import { FilterItem } from '../FilterItem'
import { FilterSection } from '../CommentsFilters'
import { FreeformAnswersState } from '../../freeform_answers/types'
import { getItemLabel } from 'core/helpers/labels'
import take from 'lodash/take.js'

const TOKEN_LIMIT = 10

export const FilterTokens = ({
    tokenId,
    stateStuff,
    entities,
    buckets,
    allTokens,
    question
}: {
    tokenId: string
    stateStuff: FreeformAnswersState
    entities: Entity[]
    buckets: Bucket[]
    allTokens: TokenWithCount[]
    question: QuestionMetadata
}) => {
    const { tokenFilter, setTokenFilter } = stateStuff
    const { getString } = useI18n()

    const tokens = take(allTokens, TOKEN_LIMIT).filter(token => token.id !== tokenId)

    return (
        <FilterSection
            headingId="token"
            showClear={tokenFilter !== null}
            onClear={() => {
                setTokenFilter(null)
            }}
        >
            <>
                {tokens.map(token => {
                    const { id, count } = token
                    const entity = entities.find(e => e.id === id) || token
                    const { shortLabel } = getItemLabel({
                        id,
                        entity,
                        getString
                        // i18nNamespace: question.id
                    })
                    return (
                        <FilterItem
                            key={id}
                            id={id}
                            question={question}
                            label={shortLabel}
                            count={count}
                            isActive={id === tokenFilter}
                            clickHandler={() => {
                                setTokenFilter(id)
                            }}
                        />
                    )
                })}
            </>
        </FilterSection>
    )
}
