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
    CorrelationVariableKind,
    CorrelationStrength,
    EditionMetadata,
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
            <CorrelationsList
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

export const CorrelationsList = ({ question, block, optionId, correlations }: CorrelationProps) => {
    const { doNotCorrelateWith } = question
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

    const directionKey = getTrendDirectionKey({ question, direction: 'positive', getString })
    const directionLabel = getString(directionKey)?.t

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
                <CorrelationsExclusions question={question} block={block} />
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

const CorrelationsExclusions = ({
    question,
    block
}: {
    question: QuestionMetadataWithSection
    block: BlockVariantDefinition
}) => {
    const { getString } = useI18n()
    const pageContext = usePageContext()
    const { currentEdition } = pageContext

    const { doNotCorrelateWith } = question
    if (!doNotCorrelateWith || doNotCorrelateWith.length == 0) {
        return null
    }
    return (
        <div className="correlations-exclusions">
            <Tooltip
                trigger={
                    <h4>
                        <T k="correlations.exclusions" />
                    </h4>
                }
                contents={<T k="correlations.exclusions.description" />}
            />

            <ul>
                {doNotCorrelateWith.map(excludedId => {
                    // the question the main variable is correlated to
                    const question = getQuestionById(currentEdition, excludedId)

                    if (!question) {
                        return null
                    }
                    const questionLabelObject = getQuestionLabel({
                        getString,
                        question,
                        block
                    })
                    const questionName = questionLabelObject.questionName

                    return <li key={excludedId}>{questionName}</li>
                })}
            </ul>
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

    let directionKey = `correlations.direction.${direction}`
    if (['shape1', 'shape2'].includes(shape)) {
        directionKey = getTrendDirectionKey({ question, direction, getString })
    }
    if (['shape5', 'shape6'].includes(shape)) {
        directionKey = `correlations.cardinality.${direction}`
    }
    const directionLabel = getString(directionKey)?.t

    const questionLabelObject = getQuestionLabel({
        getString,
        question,
        block
    })
    const questionLabel = questionLabelObject.question
    const questionName = questionLabelObject.questionName

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
                    questionName={questionName}
                    n={n}
                    optionLabel={optionLabel}
                    index={index}
                />
                <div
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

/*

Every correlation carries a kind on each side — `question` (the whole question
as an ordered scale), `option` (one answer, picked or not), or `cardinality`
(how many answers were selected) — and the pair of kinds is what decides how the
item has to be worded. Side 1 is the question being displayed, side 2 the
variable it correlates with.

The shape names double as i18n keys (`correlations.takeaway.<shape>`), so they
are kept as they are even though they no longer read as a sequence.

*/
type CorrelationShapeKey = `${CorrelationVariableKind}_${CorrelationVariableKind}`

export type CorrelationShape = 'shape1' | 'shape2' | 'shape3' | 'shape4' | 'shape5' | 'shape6'

const CORRELATION_SHAPES: Partial<Record<CorrelationShapeKey, CorrelationShape>> = {
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
    option_cardinality: 'shape6'
}

export const getCorrelationShape = (correlation: CorrelationItem): CorrelationShape => {
    const { kind1, kind2 } = correlation
    const shape = CORRELATION_SHAPES[`${kind1}_${kind2}`]
    if (!shape) {
        // the remaining combinations all have an answer count on side 1, which
        // only edition-level correlations produce; a question's own correlations
        // leave those out because they need their own card and their own wording
        throw new Error(
            `No correlation shape defined for ${kind1} × ${kind2} (${correlation.questionId1} × ${correlation.questionId2})`
        )
    }
    return shape
}

const getTrendDirectionKey = ({
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
