import { useI18n } from '@devographics/react-i18n'
import { CorrelationItem } from '@devographics/types'
import { getItemLabel } from 'core/helpers/labels'
import { getQuestionById } from 'core/helpers/options'
import { usePageContext } from 'core/helpers/pageContext'
import T from 'core/i18n/T'
import { BlockVariantDefinition } from 'core/types'
import React from 'react'
import { getTrendDirectionKey } from './helpers'
import { getCorrelationKey, getCorrelationShape, getHighlight } from './helpers'
import { CorrelationHighlightProps, CorrelationSwapProps } from './types'
import { CorrelationSubheading } from './CorrelationSubheading'
import { CorrelationValue } from './CorrelationValue'
import { CorrelationCount } from './CorrelationCount'
import { getQuestionLabel } from 'core/charts/common2/helpers/labels'

export const CorrelationItemComponent = ({
    correlation,
    block,
    index,
    activeKey,
    setActiveKey,
    enableSwap = false,
    onSwap
}: {
    correlation: CorrelationItem
    block: BlockVariantDefinition
    index: number
} & CorrelationHighlightProps &
    CorrelationSwapProps) => {
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

    // when swapping is enabled the whole card acts as a button that makes the
    // correlated question the new base question
    const swap = () => onSwap?.(correlation)
    const swapProps =
        enableSwap && onSwap
            ? {
                  role: 'button',
                  tabIndex: 0,
                  onClick: swap,
                  onKeyDown: (event: React.KeyboardEvent) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          swap()
                      }
                  }
              }
            : {}

    return (
        <div
            className={`correlation-item correlation-item-${strength} correlation-${direction} ${
                isActive ? 'correlation-item-active' : ''
            } ${enableSwap ? 'correlation-item-swappable' : ''}`}
            data-correlation-key={getCorrelationKey(correlation)}
            {...handlers}
            {...swapProps}
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
