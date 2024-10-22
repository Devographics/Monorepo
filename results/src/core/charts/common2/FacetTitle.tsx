import './FacetTitle.scss'
import React from 'react'
import { BlockVariantDefinition, PageContextValue } from 'core/types'
import { Entity, QuestionMetadata } from '@devographics/types'
import { getBlockKey, getBlockTitle } from 'core/helpers/blockHelpers'
import { useI18n } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'
import { QuestionIcon } from 'core/icons'
import T from 'core/i18n/T'

export const FacetTitle = ({
    facetQuestion,
    block,
    pageContext,
    entities
}: {
    facetQuestion: QuestionMetadata
    block: BlockVariantDefinition
    pageContext: PageContextValue
    entities: Entity[]
}) => {
    const { getString } = useI18n()

    const facetBlock = {
        id: facetQuestion?.id,
        sectionId: facetQuestion?.sectionId,
        i18nNamespace: facetQuestion?.i18nNamespace
    } as BlockVariantDefinition
    const facetQuestionKey = `${getBlockKey({ block: facetBlock })}.question`
    const translation = getString(facetQuestionKey)?.t
    return (
        <div className="chart-facet-title">
            <span className="chart-facet-title-item chart-facet-question">
                {getBlockTitle({
                    block,
                    pageContext,
                    getString,
                    entities
                })}
            </span>{' '}
            <T k="charts.vs" />{' '}
            <Tooltip
                trigger={
                    <span className="chart-facet-title-item chart-facet-facet">
                        {getBlockTitle({
                            block: facetBlock,
                            pageContext,
                            getString,
                            entities
                        })}
                        <QuestionIcon size="petite" />
                    </span>
                }
                contents={translation}
            />
        </div>
    )
}
