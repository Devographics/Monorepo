import React from 'react'
import { T } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'
import { QuestionMetadata } from '@devographics/types'
import { usePageContext } from 'core/helpers/pageContext'

export const NewQuestionIndicator = ({ question }: { question?: QuestionMetadata }) => {
    const pageContext = usePageContext()
    const { currentEdition } = pageContext
    const isNew = question?.yearAdded === currentEdition.year
    return isNew ? (
        <Tooltip
            trigger={<span className="question-label-new">✨</span>}
            contents={<T token="general.newly_added" />}
            showBorder={false}
        />
    ) : null
}
