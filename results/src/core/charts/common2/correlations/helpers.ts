import {
    CorrelationItem,
    CorrelationStrength,
    QuestionMetadataWithSection
} from '@devographics/types'
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
