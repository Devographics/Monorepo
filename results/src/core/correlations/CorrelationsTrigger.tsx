import './Correlations.scss'
import React from 'react'
import ModalTrigger from 'core/components/ModalTrigger'
import { useI18n } from '@devographics/react-i18n'
import { getBlockTitle } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { getMainHeadingKey } from './helpers'
import { CorrelationProps } from './types'
import { CorrelationsIndicator } from './CorrelationsIndicator'
import { CorrelationsContent } from './CorrelationsContent'

export const CorrelationsTrigger = ({
    question,
    optionId,
    correlations,
    block,
    type
}: CorrelationProps) => {
    const { getString, getFallbacks } = useI18n()
    const pageContext = usePageContext()
    const { allowMultiple } = question
    const count = correlations.length

    const { tClean: questionLabel } = getBlockTitle({ block, pageContext, getFallbacks })
    const optionLabel = ''

    const headingKey = getMainHeadingKey({ question, type })
    const label = getString(headingKey, {
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
            <CorrelationsContent
                question={question}
                optionId={optionId}
                correlations={correlations}
                block={block}
                type={type}
            />
        </ModalTrigger>
    )
}

const CorrelationsDirections = () => {
    return (
        <div className="correlation-directions">
            <ul>
                <li>
                    {/* <PositiveCorrelation /> */}
                    <T k="correlations.direction.positive.description" md={true} />
                </li>
                <li>
                    {/* <NegativeCorrelation /> */}
                    <T k="correlations.direction.negative.description" md={true} />
                </li>
            </ul>
        </div>
    )
}
