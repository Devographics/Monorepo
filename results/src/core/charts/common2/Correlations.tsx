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
    optionId?: string
    correlations: CorrelationItem[]
    block: BlockVariantDefinition
}

export const getCorrelationShape = (correlation: CorrelationItem) => {
    const { optionId1, optionId2 } = correlation
    if (optionId1) {
        if (optionId2) {
            /*
            ### Shape 3 
            An option is correlated with another option, e.g. "respondents who picked [women] tend to also pick discrimination = based on gender"
            */
            return 'shape3'
        } else {
            /*
            ### Shape 2
            An option is correlated with a trend, e.g. "respondents who picked [women] tend to have a lower salary"
            */
            return 'shape2'
        }
    } else if (!optionId1) {
        if (optionId2) {
            /*
            ### Shape 4 (same as shape 2)
            A trend is correlated with an option, e.g. "people who work for larger companies tend to pick "I live in the US" more"
            */
            return 'shape4'
        } else {
            /* 
            ### Shape 1
            A trend is correlated with a trend, e.g. "people who work for larger companies tend to earn more"
            */
            return 'shape1'
        }
    }
    throw new Error('Could not identify correlation shape')
}

export const Correlations = ({ question, block, optionId, correlations }: CorrelationProps) => {
    console.log({ correlations })

    const { getString, getFallbacks } = useI18n()
    const pageContext = usePageContext()

    const i18nNamespace = getOptionsNamespace({ question, block })

    const count = correlations.length

    const { tClean: questionLabel } = getBlockTitle({ block, pageContext, getFallbacks })

    // for shape2 and shape3
    let optionLabel
    if (optionId) {
        const optionLabelObject = getItemLabel({
            id: optionId,
            getString,
            i18nNamespace
        })
        optionLabel = typeof optionId !== undefined && optionLabelObject?.shortLabel
    }

    return (
        <div className="correlations-wrapper">
            <h3 className="correlations-heading">
                <T
                    k={`correlations.heading${optionLabel ? '.option' : ''}`}
                    values={{ count, questionLabel, optionLabel }}
                />
            </h3>
            <div className="correlation-directions">
                <ul>
                    <li>
                        <PositiveCorrelation />
                        <T k="correlations.direction.positive.description" md={true} />
                    </li>
                    <li>
                        <NegativeCorrelation />
                        <T k="correlations.direction.negative.description" md={true} />
                    </li>
                </ul>
            </div>
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

const CorrelationItemComponent = ({
    correlation,
    block
}: {
    correlation: CorrelationItem
    block: BlockVariantDefinition
}) => {
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

    let directionLabel

    if (['shape3', 'shape4'].includes(shape)) {
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

    let optionLabel
    if (optionId2) {
        optionLabel = getItemLabel({
            id: optionId2,
            getString,
            i18nNamespace: questionId2
        })?.shortLabel
    }

    const takeawayKey = `correlations.takeaway.${shape}`

    return (
        <div
            className={`correlation-item correlation-item-${strength} correlation-item-${direction}`}
        >
            <CorrelationValue value={correlationValue} direction={direction} />

            <div className="correlation-item-description">
                {/* <div>{shape}</div> */}
                <CorrelationSubheading
                    questionName={questionLabelObject.questionName}
                    n={n}
                    optionLabel={optionLabel}
                />
                <T
                    k={takeawayKey}
                    values={{ strengthLevelLabel, directionLabel, questionLabel, optionLabel }}
                    md={true}
                    html={true}
                />
            </div>
        </div>
    )
}

const CorrelationValue = ({ value, direction }: { value: number; direction: string }) => {
    const IconComponent = direction === 'positive' ? PositiveCorrelation : NegativeCorrelation
    return (
        <div className="correlation-item-value">
            <span className="correlation-item-value-figure">
                {value > 0 && '+'}
                {value.toFixed(2)}
            </span>
            <IconComponent />
        </div>
    )
}

const CorrelationSubheading = ({
    questionName,
    optionLabel,
    n
}: {
    questionName: string
    optionLabel?: string
    n: number
}) => {
    return (
        <div className="correlation-item-subheading">
            <h4 className="correlation-item-breadcrumbs">
                <span>{questionName}</span>
                {optionLabel && (
                    <>
                        {' '}
                        &gt; <span>{optionLabel}</span>
                    </>
                )}
            </h4>
            <div className="correlation-item-n">
                <UserIcon size={'small'} /> <span>{formatNumber(n)}</span>
            </div>
        </div>
    )
}

const PositiveCorrelation = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 48">
        <path
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 2.243h8.485v8.485m0-8.485L3.5 20.228M13 28.243h8.485v8.485m0-8.485L3.5 46.228"
        ></path>
        <path stroke="currentColor" d="M1 24h22"></path>
    </svg>
)

const NegativeCorrelation = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 48">
        <path
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 2.243h8.485v8.485m0-8.485L3.5 20.228M21.485 37.743v8.485H13m8.485 0L3.5 28.243"
        ></path>
        <path stroke="currentColor" d="M1 24h22"></path>
    </svg>
)
