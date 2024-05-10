import React from 'react'
import styled, { css } from 'styled-components'
import { mq, spacing, fontSize, color } from 'core/theme'
import BlockLegendsItem, { BlockLegendSharedProps } from './BlockLegendsItem'
import T from 'core/i18n/T'
import { BlockLegend } from 'core/types'

const BlockLegends = ({
    legends = [],
    layout = 'horizontal',
    withFrame = true,
    chipSize = 16,
    style = {},
    itemStyle = {},
    chipStyle = {},
    onMouseEnter,
    onMouseLeave,
    onClick,
    data,
    units,
    position,
    useShortLabels = layout === 'horizontal',
    chartFilters = {},
    current
}: BlockLegendSharedProps & {
    // Not strictly needed
    // block: BlockDefinition
    legends: Array<BlockLegend>
    withFrame?: boolean
    position?: 'bottom' | 'top'
}) => {
    const { facet } = chartFilters
    const blockLegends = legends

    const rootStyle = { ...style }

    return (
        <Container
            className="Block__Legends"
            style={rootStyle}
            layout={layout}
            withFrame={withFrame}
            position={position}
        >
            {facet && (
                <LegendHeading>
                    <T k={`${facet.sectionId}.${facet.id}`} />
                </LegendHeading>
            )}
            <ContainerInner layout={layout}>
                {blockLegends.map(({ id, label, shortLabel, color }) => (
                    <BlockLegendsItem
                        key={id}
                        id={id}
                        current={current}
                        label={label}
                        shortLabel={shortLabel}
                        useShortLabels={useShortLabels}
                        color={color}
                        style={itemStyle}
                        chipSize={chipSize}
                        chipStyle={chipStyle}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onClick={onClick}
                        data={data && Array.isArray(data) && data.find(b => b.id === id)}
                        units={units}
                        layout={layout}
                    />
                ))}
            </ContainerInner>
        </Container>
    )
}

const LegendHeading = styled.h4`
    margin-bottom: ${spacing(0.25)};
`

const Container = styled.table`
    .rawchartmode & {
        display: none;
    }
    font-size: ${fontSize('small')};
    /* margin-top: ${spacing()}; */
    margin-top: ${({ position }) => (position === 'bottom' ? spacing() : 0)};
    margin-bottom: ${({ position }) => (position === 'top' ? spacing() : 0)};
    width: 100%;

    ${props => {
        if (props.withFrame) {
            return css`
                border: 1px solid ${color('border')};
                padding: ${spacing(0.5)};

                @media ${mq.small} {
                    padding: ${spacing(0.5)};
                }
            `
        }
    }}
`

const ContainerInner = styled.tbody`
    ${props => {
        if (props.layout === 'horizontal') {
            return css`
                @media ${mq.mediumLarge} {
                    display: grid;
                }

                @media ${mq.medium} {
                    grid-template-columns: 1fr 1fr;
                    column-gap: ${spacing(0.75)};
                }

                @media ${mq.large} {
                    // fit in as many columns as possible as long as they're wider than Npx
                    grid-template-columns: repeat(auto-fit, minmax(140px, auto));
                    column-gap: ${spacing(0.85)};
                }
            `
        }

        if (props.layout === 'vertical') {
            return css`
                /* display: flex;
                flex-direction: column;
                justify-content: space-between; */

                @media ${mq.small} {
                    margin-top: ${spacing()};
                }
            `
        }
    }}
`

export default BlockLegends
