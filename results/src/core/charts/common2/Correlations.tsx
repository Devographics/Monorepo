import './Correlations.scss'
import React from 'react'
import ModalTrigger from 'core/components/ModalTrigger'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import { CorrelationsIcon, UserIcon } from '@devographics/icons'
import Button from 'core/components/Button'
import { useI18n } from '@devographics/react-i18n'
import { getBlockTitle } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { CorrelationItem, QuestionMetadata } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import { getItemLabel, getOptionsNamespace } from 'core/helpers/labels'
import { getQuestionLabel } from './helpers/labels'
import { getQuestionById } from 'core/helpers/options'
import round from 'lodash/round.js'
import { formatNumber } from './helpers/format'

export const CorrelationsTrigger = ({
    question,
    optionId,
    correlations,
    block
}: CorrelationProps) => {
    const { getString, getFallbacks } = useI18n()
    const pageContext = usePageContext()

    const count = correlations.length

    const { tClean: questionLabel } = getBlockTitle({ block, pageContext, getFallbacks })
    const optionLabel = ''

    const label = getString('correlations.heading', {
        values: { count, questionLabel, optionLabel }
    })?.t

    return (
        <ModalTrigger
            label={label}
            size="l"
            trigger={
                <div className="chart-correlation-indicator">
                    <Tooltip
                        trigger={
                            <Button className="chart-correlation-indicator-button button-round ">
                                <CorrelationsIcon size={'small'} />
                                <span className="chart-correlation-count">{count}</span>
                            </Button>
                        }
                        contents={
                            <T k="correlations.correlations_trigger" values={{ count }} md={true} />
                        }
                    />
                </div>
            }
        >
            <Correlations
                question={question}
                optionId={optionId}
                correlations={correlations}
                block={block}
            />
        </ModalTrigger>
    )
}

type CorrelationProps = {
    question: QuestionMetadata
    optionId: string
    correlations: CorrelationItem[]
    block: BlockVariantDefinition
}

export const Correlations = ({ question, block, optionId, correlations }: CorrelationProps) => {
    const { getString, getFallbacks } = useI18n()
    const pageContext = usePageContext()

    const i18nNamespace = getOptionsNamespace({ question, block })

    const count = correlations.length

    const { tClean: questionLabel } = getBlockTitle({ block, pageContext, getFallbacks })

    const optionLabelObject = getItemLabel({
        id: optionId,
        getString,
        i18nNamespace
    })

    const optionLabel = optionLabelObject?.shortLabel

    const heading = getString('correlations.heading', {
        values: { count, questionLabel, optionLabel }
    })?.t

    return (
        <div className="correlations-wrapper">
            <h3 className="correlations-heading">{heading}</h3>
            <div className="correlation-items">
                {correlations.map((c, i) => (
                    <CorrelationItemComponent key={i} correlation={c} block={block} />
                ))}
            </div>
            <div className="correlations-note">
                <T k="correlations.note" md={true} html={true} />
            </div>
        </div>
    )
}

export const getCorrelationShape = (correlation: CorrelationItem) =>
    correlation.optionId2 ? 'shape3' : 'shape2'

const CorrelationItemComponent = ({
    correlation,
    block
}: {
    correlation: CorrelationItem
    block: BlockVariantDefinition
}) => {
    const pageContext = usePageContext()
    const { currentEdition } = pageContext
    const { getString, getFallbacks } = useI18n()
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

    /*

    ### Shape 2
    An option is correlated with a trend, e.g. "respondents who picked [women] tend to have a lower salary"

    ### Shape 3 
    An option is correlated with another option, e.g. "respondents who picked [women] tend to also pick discrimination = based on gender"
    
    */
    const shape = getCorrelationShape(correlation)
    const isShape3 = shape === 'shape3'

    const strengthLevelLabel = getString(`correlations.strength.${strength}`)?.t

    let directionLabel

    if (isShape3) {
        directionLabel = getString(`correlations.direction.${direction}`)?.t
    } else {
        const shape2Directions = { positive: 'higher', negative: 'lower' }
        const shape2DirectionKey = shape2Directions[direction]
        const customDirectionLabelKey = `${question.section.id}.${question.id}.${shape2DirectionKey}`
        const customDirectionLabel = getString(customDirectionLabelKey)?.t

        if (customDirectionLabel) {
            directionLabel = customDirectionLabel
        } else {
            directionLabel = getString(`correlations.direction.${shape2DirectionKey}`)?.t
        }
    }

    const questionLabelObject = getQuestionLabel({
        getString,
        question,
        block
    })
    const questionLabel = questionLabelObject.question

    const optionLabel = getItemLabel({
        id: optionId2,
        getString,
        i18nNamespace: questionId2
    })?.shortLabel

    const IconComponent = direction === 'positive' ? PositiveCorrelation : NegativeCorrelation

    const takeawayKey = `correlations.takeaway.${shape}`

    return (
        <div
            className={`correlation-item correlation-item-${strength} correlation-item-${direction}`}
        >
            <div className="correlation-item-value">
                <span>{round(correlationValue, 2)}</span>
                <IconComponent />
            </div>

            {/* <div className="correlation-item-strength">{strengthLevelLabel}</div> */}
            {/* <div className="correlation-item-direction">{directionLabel}</div> */}
            <div className="correlation-item-description">
                <div className="correlation-item-subheading">
                    <h4 className="correlation-item-breadcrumbs">
                        <span>{questionLabelObject.questionName}</span>
                        {isShape3 && (
                            <>
                                {' '}
                                &gt; <span>{optionLabel}</span>
                            </>
                        )}
                    </h4>
                    <div className="correlation-item-n">
                        {/* <T k="correlations.sample_size" />{' '} */}
                        <UserIcon size={'small'} /> <span>{n}</span>
                        {/* <T k="correlations.respondents" values={{ n: formatNumber(n) }} /> */}
                    </div>
                </div>
                <T
                    k={takeawayKey}
                    values={{ strengthLevelLabel, directionLabel, questionLabel, optionLabel }}
                    md={true}
                    html={true}
                />
                {/* <T k={`correlations.strength.${strength}`} />:{' '}
                <T k={`correlations.strength.${strength}.description`} /> */}
            </div>
        </div>
    )
}

const PositiveCorrelation = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" fill="none" viewBox="0 0 24 36">
        <path stroke="currentColor" d="M1 23 23 1m0 7V1h-7M1 35l22-22m0 7v-7h-7"></path>
    </svg>
)

const NegativeCorrelation = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" fill="none" viewBox="0 0 24 36">
        <path stroke="currentColor" d="M1 23 23 1m0 7V1h-7M1 13l22 22m-7 0h7v-7"></path>
    </svg>
)
