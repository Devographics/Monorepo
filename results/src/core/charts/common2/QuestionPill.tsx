import React from 'react'
import { QuestionMetadata, QuestionMetadataWithSection } from '@devographics/types'
import { useI18n } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'
import { QuestionIcon } from '@devographics/icons'
import { getQuestionLabel } from './helpers/labels'

export const QuestionPill = ({
    question,
    i18nNamespace
}: {
    question: QuestionMetadata
    i18nNamespace?: string
}) => {
    const { getString } = useI18n()

    const {
        key,
        label,
        question: fullQuestion
    } = getQuestionLabel({
        getString,
        question,
        i18nNamespace
    })

    return (
        <Tooltip
            trigger={
                <span data-key={key} className="chart-facet-title-item chart-facet-question">
                    {label}
                    <QuestionIcon size="petite" />
                </span>
            }
            contents={fullQuestion}
        />
    )
}
