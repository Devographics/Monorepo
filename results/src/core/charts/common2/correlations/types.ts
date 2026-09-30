import {
    CorrelationItem,
    CorrelationVariableKind,
    QuestionMetadataWithSection
} from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import { Dispatch, SetStateAction } from 'react'

export type CorrelationShape =
    | 'shape1'
    | 'shape2'
    | 'shape3'
    | 'shape4'
    | 'shape5'
    | 'shape6'
    | 'shape7'
    | 'shape8'
    | 'shape9' /*

Every correlation carries a kind on each side — `question` (the whole question
as an ordered scale), `option` (one answer, picked or not), or `cardinality`
(how many answers were selected) — and the pair of kinds is what decides how the
item has to be worded. Side 1 is the question being displayed, side 2 the
variable it correlates with.

The shape names double as i18n keys (`correlations.takeaway.<shape>`), so they
are kept as they are even though they no longer read as a sequence.

*/

export type CorrelationShapeKey = `${CorrelationVariableKind}_${CorrelationVariableKind}`

export type CorrelationProps = {
    question: QuestionMetadataWithSection
    optionId?: string
    correlations: CorrelationItem[]
    block: BlockVariantDefinition
    type: 'question' | 'option'
}

/*

Links a correlation's spectrum marker and its card: hovering either one marks
both as active. Optional, so components used on their own (e.g. a card inside
a tooltip) simply don't take part.

*/
export type CorrelationHighlightProps = {
    // key of the correlation currently hovered (see getCorrelationKey), if any
    activeKey: string | null
    setActive: (key: string, isActive: boolean) => void
}

export type CorrelationExpandedProps = CorrelationHighlightProps & {
    // key of the correlation currently hovered (see getCorrelationKey), if any
    expanded: string | null
    setExpanded: Dispatch<SetStateAction<string | null>>
}
