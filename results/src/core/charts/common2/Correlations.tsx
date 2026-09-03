import './Correlations.scss'
import React from 'react'
import ModalTrigger from 'core/components/ModalTrigger'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import { UserIcon } from '@devographics/icons'
import Button from 'core/components/Button'
import { useI18n } from '@devographics/react-i18n'
import { getBlockTitle } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import {
    CorrelationItem,
    CorrelationStrength,
    QuestionMetadataWithSection
} from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import { getItemLabel, getOptionsNamespace } from 'core/helpers/labels'
import { getQuestionLabel } from './helpers/labels'
import { getQuestionById } from 'core/helpers/options'
import { formatNumber } from './helpers/format'
import { StringTranslator } from '@devographics/i18n'

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
            className="correlations-modal"
            trigger={
                <div>
                    <CorrelationsIndicator correlations={correlations} />
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

const correlationColors: Record<CorrelationStrength | 'empty', string> = {
    very_strong: '#EC5B4B',
    strong: '#E08B36',
    moderate: '#FBF467',
    weak: '#cccccc',
    empty: 'rgba(255,255,255,0.2)'
}

const formatCorrelation = (value: number) => `${value > 0 ? '+' : '-'}${Math.abs(value).toFixed(2)}`

const CorrelationsIndicator = ({ correlations }: { correlations: CorrelationItem[] }) => {
    const top9 = []
    for (let i = 0; i < 9; i++) {
        if (correlations[i]) {
            top9.push(correlations[i])
        } else {
            top9.push({ strength: 'empty' })
        }
    }
    const maxCorrelation = correlations[0]
    return (
        <div className="chart-correlation-indicator">
            <Tooltip
                trigger={
                    <Button className="chart-correlation-indicator-button button-round ">
                        {/* <CorrelationsIcon size={'small'} /> */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            {top9.map((c, i) => {
                                const col = Math.floor(i / 3)
                                const row = i % 3
                                return (
                                    <rect
                                        key={i}
                                        width="6"
                                        height="6"
                                        x={1 + row * 8}
                                        y={1 + col * 8}
                                        fill={correlationColors[c.strength]}
                                        rx="1"
                                    ></rect>
                                )
                            })}
                            {/* <rect width="6" height="6" x="1" y="9" fill="#E08B36" rx="1"></rect>
            <rect width="6" height="6" x="1" y="17" fill="#FBF467" rx="1"></rect>
            <rect width="6" height="6" x="9" y="1" fill="#E08B36" rx="1"></rect>
            <rect width="6" height="6" x="9" y="9" fill="#FBF467" rx="1"></rect>
            <rect width="6" height="6" x="9" y="17" fill="#D9D9D9" fillOpacity="0.2" rx="1"></rect>
            <rect width="6" height="6" x="17" y="1" fill="#E08B36" rx="1"></rect>
            <rect width="6" height="6" x="17" y="9" fill="#FBF467" rx="1"></rect>
            <rect width="6" height="6" x="17" y="17" fill="#D9D9D9" fillOpacity="0.2" rx="1"></rect> */}
                        </svg>
                        <span className="chart-correlation-count">
                            {formatCorrelation(maxCorrelation.correlation)}
                        </span>
                    </Button>
                }
                contents={
                    <T
                        k="correlations.correlations_trigger"
                        values={{ count: correlations.length }}
                        md={true}
                    />
                }
            />
        </div>
    )
}
type CorrelationProps = {
    question: QuestionMetadataWithSection
    optionId?: string
    correlations: CorrelationItem[]
    block: BlockVariantDefinition
}

export const Correlations = ({ question, block, optionId, correlations }: CorrelationProps) => {
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

    const directionLabel = getTrendDirectionLabel({ question, direction: 'positive', getString })

    return (
        <div className="correlations-wrapper">
            <div className="correlations-heading-wrapper">
                <h3 className="correlations-heading">
                    <T
                        k={`correlations.heading${optionLabel ? '.option' : '.direction'}`}
                        values={{ count, directionLabel, questionLabel, optionLabel }}
                        md={true}
                    />
                </h3>
            </div>
            <div className="correlations-content">
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
                        <CorrelationItemComponent index={i} key={i} correlation={c} block={block} />
                    ))}
                </div>
                <div className="correlations-note">
                    <T k="correlations.note" md={true} html={true} />
                </div>
            </div>
        </div>
    )
}

const CorrelationItemComponent = ({
    correlation,
    block,
    index
}: {
    correlation: CorrelationItem
    block: BlockVariantDefinition
    index: number
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

    let directionLabel = getString(`correlations.direction.${direction}`)?.t
    if (['shape1', 'shape2'].includes(shape)) {
        directionLabel = getTrendDirectionLabel({ question, direction, getString })
    }

    const questionLabelObject = getQuestionLabel({
        getString,
        question,
        block
    })
    const questionLabel = questionLabelObject.question

    let optionLabelObject, optionLabel
    if (optionId2) {
        optionLabelObject = getItemLabel({
            id: optionId2,
            getString,
            i18nNamespace: questionId2
        })
        optionLabel = optionLabelObject?.shortLabel
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
                    index={index}
                />
                <div
                    data-questionKey={questionLabelObject?.key}
                    data-optionKey={optionLabelObject?.key}
                >
                    <T
                        k={takeawayKey}
                        values={{ strengthLevelLabel, directionLabel, questionLabel, optionLabel }}
                        md={true}
                        html={true}
                    />
                </div>
            </div>
        </div>
    )
}

const CorrelationValue = ({ value, direction }: { value: number; direction: string }) => {
    const IconComponent = direction === 'positive' ? PositiveCorrelation : NegativeCorrelation
    return (
        <div className="correlation-item-value">
            <span className="correlation-item-value-figure">{formatCorrelation(value)}</span>
            <IconComponent />
        </div>
    )
}

const CorrelationSubheading = ({
    questionName,
    optionLabel,
    n,
    index
}: {
    questionName: string
    optionLabel?: string
    n: number
    index: number
}) => {
    return (
        <div className="correlation-item-subheading">
            <h4 className="correlation-item-breadcrumbs">
                <span>
                    {index + 1}. {questionName}
                </span>
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

const getTrendDirectionLabel = ({
    direction,
    getString,
    question
}: {
    direction: 'positive' | 'negative'
    getString: StringTranslator
    question: QuestionMetadataWithSection
}) => {
    let directionLabel
    const shape2Directions = { positive: 'higher', negative: 'lower' }
    const shape2DirectionKey = shape2Directions[direction]
    const customDirectionLabelKey = `${question?.section?.id}.${question.id}.${shape2DirectionKey}`
    const customDirectionLabel = getString(customDirectionLabelKey)?.t

    if (customDirectionLabel) {
        directionLabel = customDirectionLabel
    } else {
        directionLabel = getString(`correlations.direction.${shape2DirectionKey}`)?.t
    }
    return directionLabel
}
