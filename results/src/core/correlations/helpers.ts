import get from 'lodash/get.js'
import {
    CorrelationItem,
    CorrelationStrength,
    Correlations,
    QuestionMetadataWithSection
} from '@devographics/types'
import { PageContextValue } from 'core/types/context'
import { runQuery } from 'core/helpers/data'
import { getCorrelationsFragment } from 'core/queries/fragments/getCorrelationsFragment'
import { CorrelationHighlightProps, CorrelationProps } from './types'
import { StringTranslator } from '@devographics/i18n'

export const correlationColors: Record<CorrelationStrength | 'empty', string> = {
    very_strong: '#EC5B4B',
    strong: '#E08B36',
    moderate: '#FBF467',
    weak: '#cccccc',
    empty: 'rgba(255,255,255,0.2)'
}

export const formatCorrelation = (value: number) =>
    `${value > 0 ? '+' : '-'}${Math.abs(value).toFixed(2)}`

export const getMainHeadingKey = ({
    question,
    type
}: {
    question: QuestionMetadataWithSection
    type: CorrelationProps['type']
}) => {
    let suffix
    if (type == 'question') {
        if (question.allowMultiple) {
            // when a question supports multiple choices
            // we look at cardinality correlations
            suffix = 'cardinality'
        } else {
            // for ordinal questions (that only support one choice)
            // we look at overall trend correlations
            suffix = 'trend'
        }
    } else {
        suffix = 'option'
    }
    return `correlations.heading.${suffix}`
}

// identifies a correlation within one question's list: what side 2 is
export const getCorrelationKey = ({ kind2, questionId2, optionId2 }: CorrelationItem) =>
    [kind2, questionId2, optionId2].filter(Boolean).join('__')

/*

Everything an element needs to take part in marker/card highlighting: whether
it's the active one, and the handlers that make it so. Focus events count as
hovering, so keyboard users get the same link between marker and card.

*/
export const getHighlight = (
    correlation: CorrelationItem,
    { activeKey, setActiveKey }: CorrelationHighlightProps
) => {
    const key = getCorrelationKey(correlation)
    if (!setActiveKey) {
        return { isActive: false, handlers: {} }
    }
    return {
        isActive: activeKey === key,
        handlers: {
            onMouseEnter: () => setActiveKey(key, true),
            onMouseLeave: () => setActiveKey(key, false),
            onFocus: () => setActiveKey(key, true),
            onBlur: () => setActiveKey(key, false)
        }
    }
}

/*

Scroll the modal so that a correlation's card is in view. The card is looked up
by its key inside the same `.correlations` block as `from` (the clicked element),
so several blocks on a page can't interfere with each other, and only the
modal's own scroll container is moved, never the page behind it.

The modal's header (heading + spectrum) is sticky, so the top of the scroll
container is not the top of what the user can see: whatever sits under the
header counts as hidden. Does nothing if the card is already fully visible.

*/
const SCROLL_MARGIN = 16

export const scrollToCorrelationItem = (from: HTMLElement, key: string) => {
    const block = from.closest('.correlations')
    const item = block?.querySelector<HTMLElement>(`[data-correlation-key="${CSS.escape(key)}"]`)
    const container = item?.closest<HTMLElement>('.modal-inner')
    if (!block || !item || !container) {
        return
    }
    const itemBox = item.getBoundingClientRect()
    const containerBox = container.getBoundingClientRect()
    const headerBottom =
        block.querySelector('.correlations-heading-wrapper2')?.getBoundingClientRect().bottom ??
        containerBox.top

    // the part of the scroll container that isn't covered by the sticky header
    const visibleTop = Math.max(containerBox.top, headerBottom) + SCROLL_MARGIN
    const visibleBottom = containerBox.bottom - SCROLL_MARGIN
    if (itemBox.top >= visibleTop && itemBox.bottom <= visibleBottom) {
        return
    }
    // centre the card in the visible part
    const visibleCentre = (visibleTop + visibleBottom) / 2
    const offset = itemBox.top + itemBox.height / 2 - visibleCentre
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    container.scrollTo({
        top: container.scrollTop + offset,
        behavior: reduceMotion ? 'auto' : 'smooth'
    })
}

/*

Correlations of a question, read from the page data that is already loaded (the
same place a block's title reads them from), so browsing correlations never needs
another query. Returns undefined when nothing was loaded for that question on
this page.

The question's data normally sits at surveys.<survey>.<edition>.<section>.<id>,
but a block can alias it under another name (`workers_union_vs_country: country`),
so if the direct path has nothing, every entry of the edition is searched for one
with the question's id and correlations.

*/
export const getLoadedCorrelations = ({
    pageContext,
    question
}: {
    pageContext: PageContextValue
    question: QuestionMetadataWithSection
}): Correlations | undefined => {
    const { pageData, currentSurvey, currentEdition } = pageContext
    const editionData = get(pageData, `dataAPI.surveys.${currentSurvey.id}.${currentEdition.id}`)
    if (!editionData) {
        return undefined
    }
    const sectionId = question.sectionId || question.section?.id
    const direct = editionData[sectionId]?.[question.id]
    if (direct?._correlations) {
        return direct._correlations
    }
    for (const section of Object.values<any>(editionData)) {
        const match = Object.values<any>(section ?? {}).find(
            entry => entry?.id === question.id && entry?._correlations
        )
        if (match) {
            return match._correlations
        }
    }
    return undefined
}

/*

Fetch the correlations of one question from the API, for when they weren't loaded
with the page. The query asks for nothing but `_correlations`, so the response
is a few KB rather than a block's worth of buckets, entities and comments.

*/
export const fetchCorrelations = async ({
    pageContext,
    question
}: {
    pageContext: PageContextValue
    question: QuestionMetadataWithSection
}): Promise<{ correlations?: Correlations; error?: any }> => {
    const { currentSurvey, currentEdition } = pageContext
    const url = process.env.GATSBY_API_URL
    if (!url) {
        return { error: new Error('GATSBY_API_URL env variable is not set') }
    }
    const sectionId = question.sectionId || question.section?.id
    const query = `query {
    surveys {
        ${currentSurvey.id} {
            ${currentEdition.id} {
                ${sectionId} {
                    ${question.id} {
                        id
                        ${getCorrelationsFragment()}
                    }
                }
            }
        }
    }
}`
    const { result, error } = await runQuery<any>(url, query, `${question.id}CorrelationsQuery`)
    if (error) {
        return { error }
    }
    const data = get(
        result,
        `surveys.${currentSurvey.id}.${currentEdition.id}.${sectionId}.${question.id}`
    )
    return { correlations: data?._correlations }
}

export const getCorrelationShape = ({ kind1, kind2 }: CorrelationItem): CorrelationShape =>
    CORRELATION_SHAPES[`${kind1}_${kind2}`]

export const getTrendDirectionKey = ({
    direction,
    getString,
    question
}: {
    direction: 'positive' | 'negative'
    getString: StringTranslator
    question: QuestionMetadataWithSection
}) => {
    let directionKey
    const shape2Directions = { positive: 'higher', negative: 'lower' }
    const shape2DirectionKey = shape2Directions[direction]
    const customDirectionLabelKey = `${question?.section?.id}.${question.id}.${shape2DirectionKey}`

    const customDirectionLabel = getString(customDirectionLabelKey)?.t

    if (customDirectionLabel) {
        directionKey = customDirectionLabelKey
    } else {
        directionKey = `correlations.direction.${shape2DirectionKey}`
    }
    return directionKey
}

import { CorrelationShapeKey } from './types'
import { CorrelationShape } from './types'

// every combination of kinds is mapped, so adding a kind is a type error here
// rather than a missing shape at render time

export const CORRELATION_SHAPES: Record<CorrelationShapeKey, CorrelationShape> = {
    // a trend with a trend: "people who work for larger companies tend to earn more"
    question_question: 'shape1',
    // an option with a trend: "respondents who picked [women] tend to have a lower salary"
    option_question: 'shape2',
    // an option with an option: "respondents who picked [women] tend to also pick
    // discrimination = based on gender"
    option_option: 'shape3',
    // a trend with an option: "people who work for larger companies tend to pick
    // 'I live in the US' more"
    question_option: 'shape4',
    // a trend with an answer count: "people who work for larger companies reported
    // more workplace issues"
    question_cardinality: 'shape5',
    // an option with an answer count: "respondents who have had one employer
    // reported fewer workplace issues"
    option_cardinality: 'shape6',
    // an answer count with a trend: "respondents who selected more workplace perks
    // tend to score higher on job happiness"
    cardinality_question: 'shape7',
    // an answer count with an option: "respondents who selected more physical
    // activities tend to also pick [sports & exercise] as a hobby"
    cardinality_option: 'shape8',
    // an answer count with an answer count: "respondents who selected more career
    // issues tend to also select more negative impacts"
    cardinality_cardinality: 'shape9'
}
