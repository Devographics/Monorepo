import './FreeformAnswers.scss'
import React from 'react'
import { RawDataAnswer, NormalizationToken, Bucket, TokenWithCount } from '@devographics/types'
import { getCommentReportUrl, highlightWordStarts } from '../comments/CommentsItem'
import { CommentsItemWrapper } from '../comments/CommentsItemWrapper'
import { FreeformAnswersState } from './types'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import sortBy from 'lodash/sortBy.js'

export const FreeformAnswerItem = ({
    rawHtml,
    responseId,
    index,
    questionLabel,
    tokenId,
    tokenLabel,
    tokens,
    stateStuff,
    buckets,
    allTokens
}: RawDataAnswer & {
    index: number
    questionLabel: string
    tokenId: string
    tokenLabel: string
    stateStuff: FreeformAnswersState
    buckets: Bucket[]
    allTokens: TokenWithCount[]
}) => {
    const { keywordFilter, searchFilter } = stateStuff
    let formattedMessage = rawHtml
    if (keywordFilter) {
        formattedMessage = highlightWordStarts(formattedMessage, keywordFilter)
    }
    if (searchFilter) {
        formattedMessage = highlightWordStarts(formattedMessage, searchFilter)
    }

    return (
        <CommentsItemWrapper
            index={index}
            contents={formattedMessage}
            answer={
                <Tokens
                    mainTokenId={tokenId}
                    allTokens={allTokens}
                    tokens={tokens}
                    buckets={buckets}
                    stateStuff={stateStuff}
                />
                // <>
                //     {' '}
                //     {tokens.map(token => (
                //         <TokenItem
                //             key={token.id}
                //             token={token}
                //             stateStuff={stateStuff}
                //             buckets={buckets}
                //         />
                //     ))}
                // </>
            }
            reportLink={getCommentReportUrl({
                responseId,
                message: rawHtml,
                questionLabel: questionLabel + '/' + tokenLabel
            })}
        />
    )
}

type TokenWithAncestors = NormalizationToken & {
    ancestors?: string[]
}

/*

Build a pruned-down version of the question's buckets tree 
(which contains all nested buckets) that only includes the buckets that are
actually mentioned in the answer currently being considered, while preserving
the same nested structure. 

*/
function pruneTree(buckets: Bucket[], allowedIds: string[]): Bucket[] {
    const pruned: Bucket[] = []

    for (const bucket of buckets) {
        // If item has nested children, prune them recursively
        if (bucket.nestedBuckets && bucket.nestedBuckets.length > 0) {
            const prunedChildren = pruneTree(bucket.nestedBuckets, allowedIds)

            // Keep this node if it has any remaining children after pruning
            // OR if it itself is in the allowed list
            if (prunedChildren.length > 0 || allowedIds.includes(bucket.id)) {
                pruned.push({
                    ...bucket,
                    nestedBuckets: prunedChildren.length > 0 ? prunedChildren : undefined
                })
            }
        } else {
            // Leaf node: keep it only if it's in the allowed list
            if (allowedIds.includes(bucket.id)) {
                pruned.push(bucket)
            }
        }
    }

    return pruned
}

/*

Flatten out the nested bucket tree into an array of items containing 
the id of a "leaf" token, as well as an array of its ancestors. 

*/
function getLeavesWithAncestors(buckets: Bucket[], ancestors: string[] = []): TokenWithAncestors[] {
    const result: TokenWithAncestors[] = []

    for (const bucket of buckets) {
        const currentAncestors = [...ancestors]
        if (bucket.nestedBuckets && bucket.nestedBuckets.length > 0) {
            // Recurse into children, passing the current item as an ancestor
            result.push(
                ...getLeavesWithAncestors(bucket.nestedBuckets, [bucket.id, ...currentAncestors])
            )
        } else {
            // Leaf node — include ancestors if any
            result.push(
                currentAncestors.length > 0
                    ? { id: bucket.id, ancestors: currentAncestors.reverse() } // reverse to get root → leaf order
                    : { id: bucket.id }
            )
        }
    }

    return result
}

/*

Flatten out nested buckets tree

*/
export function getFlattenedBucketsTree(buckets: Bucket[], keepRootNodes = true): Bucket[] {
    return flattenBucketsTree(buckets, keepRootNodes)
}

export function flattenBucketsTree(buckets: Bucket[], keepRootNodes = true): Bucket[] {
    const result: Bucket[] = []
    for (const bucket of buckets) {
        const { nestedBuckets, ...bucketWithoutNestedBuckets } = bucket
        if (nestedBuckets && nestedBuckets.length > 0) {
            // Recurse into children, passing the current item as an ancestor
            result.push(...flattenBucketsTree(nestedBuckets))
            if (keepRootNodes) {
                // has children, only add if we're keeping non-leaves/root nodes
                result.push(bucketWithoutNestedBuckets)
            }
        } else {
            // no children, always add leaves
            result.push(bucketWithoutNestedBuckets)
        }
    }
    return result
}

const Tokens = ({
    mainTokenId,
    tokens,
    allTokens,
    buckets,
    stateStuff
}: {
    mainTokenId: string
    tokens: NormalizationToken[]
    allTokens: TokenWithCount[]
    buckets: Bucket[]
    stateStuff: FreeformAnswersState
}) => {
    /*

    Note: nested structure currently comes from question buckets, which
    doesn't work for "extra" tokens that are *not* included in the question
    (for example: question view is limited to first 10 items, but raw data
    inculdes tokens beyond those)

    TODO: rework this so nesting is based on tokens issued 
    from raw data GraphQL query instead of question buckets.

    */
    const tokenIds = tokens.map(token => token.id)
    const prunedBuckets = pruneTree(buckets, tokenIds)
    const leafTokens = getLeavesWithAncestors(prunedBuckets)
    const allBuckets = getFlattenedBucketsTree(buckets)
    const allBucketsIds = allBuckets.map(b => b.id)
    const extraTokens = tokens.filter(token => !allBucketsIds.includes(token.id))

    return (
        <div className="token-items">
            {leafTokens.map(token => (
                <Token
                    key={token.id}
                    token={token}
                    mainTokenId={mainTokenId}
                    allTokens={allTokens}
                    allBuckets={allBuckets}
                    stateStuff={stateStuff}
                />
            ))}
            {extraTokens.length > 0 &&
                extraTokens.map(token => (
                    <Token
                        key={token.id}
                        token={token}
                        mainTokenId={mainTokenId}
                        allTokens={allTokens}
                        allBuckets={allBuckets}
                        stateStuff={stateStuff}
                    />
                ))}
        </div>
    )
}

const Token = ({
    mainTokenId,
    token,
    allTokens,
    allBuckets,
    stateStuff
}: {
    mainTokenId: string
    token: TokenWithAncestors
    allTokens: TokenWithCount[]
    allBuckets: Bucket[]
    stateStuff: FreeformAnswersState
}) => {
    const fullToken = allTokens.find(t => t.id === token.id)
    const { tokenFilter } = stateStuff
    const { id, ancestors } = token
    const { getString } = useI18n()
    const isHighlighted =
        ancestors?.includes(mainTokenId) || mainTokenId === id || tokenFilter === id
    const bucket = allBuckets.find(b => b.id === id)

    const labelObject = getItemLabel({
        id,
        entity: bucket?.entity || fullToken,
        getString,
        // i18nNamespace,
        html: true
    })
    const { key, label } = labelObject

    return (
        <div className={`token-item token-item-${isHighlighted ? 'main' : ''}`}>
            {ancestors && (
                <div className="token-item-ancestors">
                    {ancestors?.map((tokenId, index) => {
                        const ancestorBucket = allBuckets.find(b => b.id === tokenId)
                        const ancestorLabelObject = getItemLabel({
                            id,
                            entity: ancestorBucket?.entity,
                            getString,
                            // i18nNamespace,
                            html: true
                        })

                        const { key, label: ancestorLabel } = ancestorLabelObject
                        return (
                            <>
                                <span
                                    key={tokenId}
                                    className="token-item-ancestor"
                                    dangerouslySetInnerHTML={{ __html: ancestorLabel }}
                                />
                                {index < ancestors.length - 1 && (
                                    <span className="token-item-ancestor-separator" />
                                )}
                            </>
                        )
                    })}
                </div>
            )}
            <div className="token-item-label" dangerouslySetInnerHTML={{ __html: label }} />
        </div>
    )
}
