import { useI18n } from '@devographics/react-i18n'
import { CorrelationItem } from '@devographics/types'
import { getItemLabel } from 'core/helpers/labels'
import { getQuestionById } from 'core/helpers/options'
import { usePageContext } from 'core/helpers/pageContext'
import T from 'core/i18n/T'
import { BlockVariantDefinition } from 'core/types'
import React from 'react'
import { getQuestionLabel } from '../helpers/labels'
import { getTrendDirectionKey } from './helpers'
import { getCorrelationShape, getHighlight } from './helpers'
import { CorrelationHighlightProps } from './types'
import { CorrelationSubheading } from './CorrelationSubheading'
import { CorrelationValue } from './CorrelationValue'
import { CorrelationCount } from './CorrelationCount'

export const CorrelationItemComponent = ({
    correlation,
    block,
    index,
    activeKey,
    setActiveKey
}: {
    correlation: CorrelationItem
    block: BlockVariantDefinition
    index: number
} & CorrelationHighlightProps) => {
    let optionLabelObject, optionLabel

    const pageContext = usePageContext()
    const { currentEdition } = pageContext
    const { getString } = useI18n()
    const {
        strength,
        correlation: correlationValue,
        direction,
        optionId2,
        questionId2,
        n
    } = correlation

    // the question the main variable is correlated to
    const question = getQuestionById(currentEdition, questionId2)

    if (!question) {
        return (
            <div>
                Could not find question <code>{questionId2}</code>
            </div>
        )
    }

    const shape = getCorrelationShape(correlation)

    const strengthLevelLabel = getString(`correlations.strength.${strength}`)?.t

    let directionKey = `correlations.direction.${direction}`
    if (['shape1', 'shape2', 'shape7'].includes(shape)) {
        directionKey = getTrendDirectionKey({ question, direction, getString })
        optionLabel = getString('correlations.trend.subheading')?.t
    }
    if (['shape5', 'shape6', 'shape9'].includes(shape)) {
        directionKey = `correlations.cardinality.${direction}`
        optionLabel = getString('correlations.cardinality.subheading')?.t
    }
    const directionLabel = getString(directionKey)?.t

    const questionLabelObject = getQuestionLabel({
        getString,
        question,
        block
    })
    const questionLabel = questionLabelObject.question
    const questionName = questionLabelObject.questionName

    if (optionId2) {
        optionLabelObject = getItemLabel({
            id: optionId2,
            getString,
            i18nNamespace: questionId2
        })
        optionLabel = optionLabelObject?.shortLabel
    }

    const takeawayKey = `correlations.takeaway.${shape}`

    const { isActive, handlers } = getHighlight(correlation, { activeKey, setActiveKey })

    return (
        <div
            className={`correlation-item correlation-item-${strength} correlation-${direction} ${
                isActive ? 'correlation-item-active' : ''
            }`}
            {...handlers}
        >
            <div className="correlation-item-description">
                {/* <div>{shape}</div> */}
                <CorrelationSubheading
                    questionName={questionName}
                    n={n}
                    optionLabel={optionLabel}
                    index={index}
                />
                <div
                    className="correlation-item-contents"
                    data-questionKey={questionLabelObject?.key}
                    data-questionName={questionName}
                    data-questionLabel={questionLabel}
                    data-optionKey={optionLabelObject?.key}
                    data-optionLabel={optionLabel}
                    data-directionKey={directionKey}
                >
                    <T
                        k={takeawayKey}
                        values={{
                            strengthLevelLabel,
                            directionLabel,
                            questionLabel: questionLabel || questionName,
                            optionLabel
                        }}
                        md={true}
                        html={true}
                    />
                </div>
            </div>

            <CorrelationValue value={correlationValue} direction={direction} shape={shape} />

            <CorrelationCount n={n} />
        </div>
    )
}
