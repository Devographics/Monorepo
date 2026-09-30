import { useI18n } from '@devographics/react-i18n'
import { QuestionMetadataWithSection } from '@devographics/types'
import { getQuestionLabel } from 'core/charts/common2/helpers/labels'
import Tooltip from 'core/components/Tooltip'
import { getQuestionById } from 'core/helpers/options'
import { usePageContext } from 'core/helpers/pageContext'
import T from 'core/i18n/T'
import { BlockVariantDefinition } from 'core/types'
import React from 'react'

export const CorrelationsExclusions = ({
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
                    <span>
                        <T k="correlations.exclusions" />{' '}
                        {doNotCorrelateWith.map((excludedId, index) => {
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

                            return (
                                <>
                                    {index > 0 && ', '}
                                    <strong key={excludedId}>{questionName}</strong>
                                </>
                            )
                        })}
                    </span>
                }
                contents={<T k="correlations.exclusions.description" />}
            />
        </div>
    )
}
