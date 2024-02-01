import React from 'react'
import styled, { css } from 'styled-components'
import { mq, spacing } from 'core/theme'
import { BlockLegend } from 'core/types'

type BlockEventHandler = ({ id, label, color }: Pick<BlockLegend, 'id' | 'label' | 'color'>) => void

export interface BlockLegendSharedProps {
    layout?: 'horizontal' | 'vertical'
    useShortLabels?: boolean
    chartFilters?: any
    current?: any
    chipSize: number
    style?: any
    itemStyle?: any
    chipStyle?: any
    onMouseEnter: BlockEventHandler
    onMouseLeave: BlockEventHandler
    onClick: BlockEventHandler
    units: 'percentage' | string
    data?: { [units: string]: any }
}
type BlockLegendsItemProps = BlockLegendSharedProps & BlockLegend

const BlockLegendsItem = (props: BlockLegendsItemProps) => {
    const {
        id,
        color,
        label,
        shortLabel,
        chipSize,
        style,
        chipStyle,
        data,
        units,
        onMouseEnter,
        onMouseLeave,
        onClick,
        useShortLabels,
        layout,
        current = null
    } = props

    const handleMouseEnter = () => {
        if (onMouseEnter === undefined) return
        onMouseEnter({ id, label, color })
    }

    const handleMouseLeave = () => {
        if (onMouseLeave === undefined) return
        onMouseLeave({ id, label, color })
    }

    const handleClick = () => {
        if (onClick === undefined) return
        onClick({ id, label, color })
    }

    const isInteractive = typeof onMouseEnter !== 'undefined'

    const state = current === null ? 'default' : current === id ? 'active' : 'inactive'

    const label_ = useShortLabels ? shortLabel ?? label : label

    // const label_ = getItemLabel({ id, entity, getString, i18Namespace })

    return (
        <Container
            className={`Legends__Item ${shortLabel ? 'Legends__Item--withKeyLabel' : ''}`}
            style={style}
            isInteractive={isInteractive}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            state={state}
        >
            {color && (
                <ChipWrapper layout={layout}>
                    <Chip
                        style={{
                            width: chipSize,
                            height: chipSize,
                            background: color,
                            ...chipStyle
                        }}
                    />
                </ChipWrapper>
            )}
            {!color && shortLabel && (
                <KeyLabel layout={layout} className="Legends__Item__KeyLabel">
                    {shortLabel}{' '}
                </KeyLabel>
            )}
            <Label
                layout={layout}
                className="Legends__Item__Label"
                dangerouslySetInnerHTML={{
                    __html: label_
                }}
            />
            {data && (
                <Value layout={layout} className="Legends__Item__Value">
                    {units === 'percentage' ? `${data[units]}%` : data[units]}
                </Value>
            )}
        </Container>
    )
}

const Container = styled.tr`
    cursor: default;
    display: flex;
    align-items: center;

    &:last-child {
        margin-bottom: 0;
    }

    ${({ isInteractive, theme }) => {
        if (isInteractive) {
            return css`
                cursor: pointer;
                &:hover {
                    background: ${theme.colors.backgroundAlt};
                }
            `
        }
    }}

    ${({ state, theme }) => {
        if (state === 'active') {
            return css`
                /* background: ${theme.colors.backgroundAlt}; */
            `
        } else if (state === 'inactive') {
            return css`
                opacity: 0.25;
            `
        }
    }}
`

const ChipWrapper = styled.th`
    padding: ${spacing(0.25)} ${spacing(0.5)} ${spacing(0.25)};
`
const Chip = styled.div``

const KeyLabel = styled.th`
    padding: ${spacing(0.25)} ${spacing(0.5)} ${spacing(0.25)} 0;
    text-align: left;
`

const Label = styled.td`
    padding: ${spacing(0.2)} ${spacing(0.5)} ${spacing(0.25)} 0;
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    @media ${mq.large} {
        white-space: nowrap;
    }
`

const Value = styled.td`
    padding: ${spacing(0.25)} ${spacing(0.5)} ${spacing(0.25)} 0;
`
export default BlockLegendsItem
