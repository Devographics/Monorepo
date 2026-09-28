import { CorrelationItem, CorrelationVariableKind, QuestionMetadataWithSection } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'

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

export type CorrelationShapeKey = `${CorrelationVariableKind}_${CorrelationVariableKind}`export type CorrelationProps = {
    question: QuestionMetadataWithSection
    optionId?: string
    correlations: CorrelationItem[]
    block: BlockVariantDefinition
    type: 'question' | 'option'
}

