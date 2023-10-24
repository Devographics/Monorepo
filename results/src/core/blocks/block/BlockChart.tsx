import React from 'react'
import styled from 'styled-components'
import { spacing } from 'core/theme'
import BlockNote from 'core/blocks/block/BlockNote'
import BlockLegends from 'core/blocks/block/BlockLegends'
import { useI18n } from 'core/i18n/i18nContext'
import { usePageContext } from 'core/helpers/pageContext'
import { useBlockDescription, useBlockTitle, useBlockQuestion } from 'core/helpers/blockHelpers'
import T from 'core/i18n/T'
import BlockFooter from 'core/blocks/block/BlockFooter'
import BlockUnitsSelector from 'core/blocks/block/BlockUnitsSelector'
import EditInline from 'core/components/EditInline'
import BlockLinks from 'core/blocks/block/BlockLinks'
import { BlockDefinition } from 'core/types'
import { Entity } from '@devographics/types'

const BlockChart = props => {
    const {
        children,
        units,
        error,
        data,
        block = {},
        entity,
        legends,
        legendProps,
        modeProps,
        chartFilters
    } = props
    const { legendPosition = 'top', switcherPosition = 'top', showNote = true, customChart } = block
    const { translate } = useI18n()
    const context = usePageContext()
    const { isCapturing } = context

    const legendProps_ = {
        block,
        data,
        units,
        position: legendPosition,
        legends,
        chartFilters,
        ...legendProps
    }

    return (
        <div>
            <BlockDescriptionContents block={block} />
            <BlockQuestionContents block={block} />
            {entity && !isCapturing && <BlockLinks entity={entity} />}
            <BlockFooter {...props} />

            {legends && legendPosition === 'top' && <BlockLegends {...legendProps_} />}
            {modeProps && switcherPosition === 'top' && (
                <SwitcherWrapper>
                    <BlockUnitsSelector {...modeProps} />
                </SwitcherWrapper>
            )}

            <div className="Block__Contents">
                {error ? <div className="error">{error}</div> : children}
            </div>
            {customChart && (
                <div className="Block__Contents">
                    <CustomChartHeading>
                        <EditInline defaultValue={translate('custom_data.chart_title')} />
                    </CustomChartHeading>
                    {React.cloneElement(customChart, {
                        controlledMode: modeProps?.units,
                        controlledUnits: units,
                        isCustom: true
                    })}
                </div>
            )}
            {legends && legendPosition === 'bottom' && <BlockLegends {...legendProps_} />}
            {modeProps && switcherPosition === 'bottom' && (
                <SwitcherWrapper>
                    <BlockUnitsSelector {...modeProps} />
                </SwitcherWrapper>
            )}
            {showNote && <BlockNote block={block} />}
        </div>
    )
}

export const BlockDescriptionContents = ({ block }: { block: BlockDefinition }) => {
    const blockTitle = useBlockTitle({ block })
    const blockDescription = useBlockDescription({ block, values: { name: blockTitle } })
    if (blockDescription) {
        return (
            <Description className="Block__Description">
                {blockDescription} {block.isFreeform && <T k="blocks.freeform" />}
            </Description>
        )
    }
    return null
}

const BlockQuestionContents = ({ block }: { block: BlockDefinition }) => {
    const blockQuestion = useBlockQuestion({ block })
    if (blockQuestion) {
        return <Description className="Block__Question">(?) {blockQuestion}</Description>
    }
    return null
}

const SwitcherWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: ${spacing()};
`

const Description = styled.div`
    .rawchartmode & {
        display: none;
    }
    margin-bottom: ${spacing(1)};

    p {
        &:last-child {
            margin: 0;
        }
    }
`

const CustomChartHeading = styled.h3``

export default BlockChart
