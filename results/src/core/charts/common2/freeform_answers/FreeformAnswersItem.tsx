import './FreeformAnswers.scss'
import React from 'react'
import T from 'core/i18n/T'
import { RawDataItem, NormalizationToken, Bucket } from '@devographics/types'
import { getCommentReportUrl, highlightWordStarts } from '../comments/CommentsItem'
import { CommentsItemWrapper } from '../comments/CommentsItemWrapper'
import { FreeformAnswersState } from './types'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'

export const FreeformAnswerItem = ({
    rawHtml,
    responseId,
    index,
    questionLabel,
    tokenId,
    tokenLabel,
    tokens,
    stateStuff,
    buckets
}: RawDataItem & {
    index: number
    questionLabel: string
    tokenId: string
    tokenLabel: string
    stateStuff: FreeformAnswersState
    buckets: Bucket[]
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
                <Tokens mainTokenId={tokenId} tokens={tokens} buckets={buckets} />
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
        if (bucket.groupedBuckets && bucket.groupedBuckets.length > 0) {
            const prunedChildren = pruneTree(bucket.groupedBuckets, allowedIds)

            // Keep this node if it has any remaining children after pruning
            // OR if it itself is in the allowed list
            if (prunedChildren.length > 0 || allowedIds.includes(bucket.id)) {
                pruned.push({
                    ...bucket,
                    groupedBuckets: prunedChildren.length > 0 ? prunedChildren : undefined
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
        if (bucket.groupedBuckets && bucket.groupedBuckets.length > 0) {
            // Recurse into children, passing the current item as an ancestor
            result.push(
                ...getLeavesWithAncestors(bucket.groupedBuckets, [bucket.id, ...currentAncestors])
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
function flattenBucketsTree(buckets: Bucket[]): Bucket[] {
    const result: Bucket[] = []
    for (const bucket of buckets) {
        result.push(bucket)
        if (bucket.groupedBuckets && bucket.groupedBuckets.length > 0) {
            // Recurse into children, passing the current item as an ancestor
            result.push(...flattenBucketsTree(bucket.groupedBuckets))
        }
    }
    return result
}

const Tokens = ({
    mainTokenId,
    tokens,
    buckets
}: {
    mainTokenId: string
    tokens: NormalizationToken[]
    buckets: Bucket[]
}) => {
    const tokenIds = tokens.map(token => token.id)
    const prunedBuckets = pruneTree(buckets, tokenIds)
    const leafTokens = getLeavesWithAncestors(prunedBuckets)
    const allBuckets = flattenBucketsTree(buckets)

    return (
        <div className="token-items">
            {leafTokens.map(token => (
                <Token
                    key={token.id}
                    token={token}
                    mainTokenId={mainTokenId}
                    allBuckets={allBuckets}
                />
            ))}
        </div>
    )
}

const Token = ({
    mainTokenId,
    token,
    allBuckets
}: {
    mainTokenId: string
    token: TokenWithAncestors
    allBuckets: Bucket[]
}) => {
    const { id, ancestors } = token
    const { getString } = useI18n()
    const isHighlighted = ancestors?.includes(mainTokenId) || mainTokenId === id
    const bucket = allBuckets.find(b => b.id === id)

    const labelObject = getItemLabel({
        id,
        entity: bucket?.entity,
        getString,
        // i18nNamespace,
        html: true
    })
    const { key, label } = labelObject

    console.log({ bucket })

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
                        console.log({ ancestorBucket })

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
