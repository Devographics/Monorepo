import React from 'react'
import { BlockDefinition, PageContextValue } from 'core/types'
import { Entity, QuestionMetadata } from '@devographics/types'
import { getBlockKey, getBlockTitle } from 'core/helpers/blockHelpers'
import { useI18n } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'
import { QuestionIcon } from 'core/icons'

export const FacetQuestion = ({
    facetQuestion,
    pageContext,
    entities
}: {
    facetQuestion: QuestionMetadata
    pageContext: PageContextValue
    entities: Entity[]
}) => {
    const { getString } = useI18n()

    const facetBlock = {
        id: facetQuestion?.id,
        sectionId: facetQuestion?.sectionId
    } as BlockDefinition
    const facetQuestionKey = `${getBlockKey({ block: facetBlock })}.question`
    const translation = getString(facetQuestionKey)?.t
    return (
        <Tooltip
            trigger={
                <div className="chart-facet-question">
                    <span className="chart-facet-title">
                        {getBlockTitle({
                            block: facetBlock,
                            pageContext,
                            getString,
                            entities
                        })}
                    </span>
                    <QuestionIcon />
                </div>
            }
            contents={translation}
        />
    )
}
