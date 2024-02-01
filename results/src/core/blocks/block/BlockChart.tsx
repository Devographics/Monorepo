import React from 'react'
import styled from 'styled-components'
import { fontSize, spacing } from 'core/theme'
import BlockNote from 'core/blocks/block/BlockNote'
import BlockLegends from 'core/blocks/block/BlockLegends'
import { useI18n } from '@devographics/react-i18n'
import { usePageContext } from 'core/helpers/pageContext'
import { useBlockDescription, useBlockTitle } from 'core/helpers/blockHelpers'
import T from 'core/i18n/T'
import BlockFooter from 'core/blocks/block/BlockFooter'
import BlockUnitsSelector from 'core/blocks/block/BlockUnitsSelector'
import EditInline from 'core/components/EditInline'
import BlockLinks from 'core/blocks/block/BlockLinks'
import { BlockDefinition } from 'core/types'
import BlockQuestion from './BlockQuestion'

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
            <BlockQuestion block={block} />
        </div>
    )
}

export const BlockDescriptionContents = ({ block }: { block: BlockDefinition }) => {
    const blockTitle = useBlockTitle({ block })
    const blockDescription = useBlockDescription({ block, values: { name: blockTitle } })
    if (blockDescription) {
        return (
            <Description className="Block__Description">
                <div dangerouslySetInnerHTML={{ __html: blockDescription }} />{' '}
                {block.isFreeform && <T k="blocks.freeform" />}
            </Description>
        )
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
    font-size: ${fontSize('medium')};
    p {
        &:last-child {
            margin: 0;
        }
    }
    mark {
        font-style: normal;
        margin: 0 -0.4em;
        padding: 0.1em 0.4em;
        border-radius: 0.8em 0.3em;
        background: transparent;
        background-image: linear-gradient(
            to right,
            rgba(255, 225, 225, 0.1),
            rgba(255, 225, 225, 0.4) 4%,
            rgba(255, 225, 225, 0.2)
        );
        -webkit-box-decoration-break: clone;
        box-decoration-break: clone;
    }
`

const CustomChartHeading = styled.h3``

export default BlockChart
