import React, { memo } from 'react'
import { useTheme } from 'styled-components'
import styled from 'styled-components'
import { mq, spacing, fontSize, fontWeight } from 'core/theme'
import T from 'core/i18n/T'
import { useI18n } from '@devographics/react-i18n'
import TooltipComponent from 'core/components/Tooltip'

const InsufficientData = (props: {
    bars: Array<any>
    width?: any
    innerWidth?: any
    yScale?: any
    role?: string
}) => {
    const { getString } = useI18n()

    const { bars, width, yScale, role, innerWidth } = props

    const rows: string[] = []
    const step = yScale.step()

    return bars.map((bar, i) => {
        const rowId = bar?.data?.indexValue
        const insufficientData = bar?.data?.data.hasInsufficientData
        if (insufficientData && !rows.includes(rowId)) {
            // only show "insufficient data" label once per row
            rows.push(rowId)
            return (
                <g key={bar.key}>
                    <Rect_
                        y={bar.y + bar.height / 2 - step / 2 + step * 0.1}
                        width={innerWidth}
                        height={step * 0.8}
                    />

                    <TooltipComponent
                        trigger={
                            <Text_
                                role={role}
                                className="insufficient-data"
                                x={innerWidth / 2}
                                y={bar.y + step / 2 - 2}
                                width={innerWidth}
                                textAnchor="middle"
                            >
                                {getString('charts.insufficient_data')?.t}
                            </Text_>
                        }
                        contents={
                            <T k="charts.insufficient_data.description" values={{ value: 10 }} />
                        }
                        asChild={true}
                    />
                </g>
            )
        } else {
            return null
        }
    })
}

const Rect_ = styled.rect`
    fill: ${({ theme }) => theme.colors.background};
    opacity: 0.8;
`

const Text_ = styled.text`
    fill: ${({ theme }) => theme.colors.text};
    opacity: 0.7;
    text-transform: uppercase;
    font-weight: ${fontWeight('bold')};
    font-size: ${fontSize('smaller')};
    text-align: center;
    cursor: default;
`

export default memo(InsufficientData)
