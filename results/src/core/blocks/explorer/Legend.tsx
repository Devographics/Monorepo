import React, { useState } from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize, fontWeight } from 'core/theme'
import T from 'core/i18n/T'
import { CommonProps } from './types'
import { Dot } from './CellDots'
import Tooltip from 'core/components/Tooltip'

const Legend = (props: CommonProps) => {
    const { totalCount, stateStuff } = props
    const { respondentsPerDot, percentsPerDot, dotsPerLine, unit } = stateStuff
    const tProps = {
        md: true,
        html: true,
        values: { totalCount, respondentsPerDot, percentsPerDot, dotsPerLine }
    }
    return (
        <MainLegend_>
            <LegendItem type="normal" unit={unit} tProps={tProps} />
            <LegendItem type="extra" unit={unit} tProps={tProps} />
            <LegendItem type="missing" unit={unit} tProps={tProps} />
        </MainLegend_>
    )
}

const LegendItem = ({ type, unit, tProps }) => {
    const labelId = type === 'normal' ? `explorer.${unit}_per_dot` : `explorer.${type}_respondents`
    return (
        <Tooltip
            trigger={
                <div>
                    <LegendItem_>
                        <LegendSymbol_>
                            <Dot dot={{ type }} unit={unit} />
                        </LegendSymbol_>
                        <T k={labelId} {...tProps} />
                    </LegendItem_>
                </div>
            }
            contents={<T k={`${labelId}.tooltip`} {...tProps} />}
        />
    )
}

const MainLegend_ = styled.div`
    color: ${({ theme }) => theme.colors.textAlt};
    font-size: ${fontSize('small')};
    display: flex;
    gap: ${spacing()};
    @media ${mq.small} {
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    @media ${mq.Mediumlarge} {
        align-items: center;
    }
`

const LegendItem_ = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`

const LegendSymbol_ = styled.div``

export default Legend
