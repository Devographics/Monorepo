import React from 'react'
import styled, { useTheme } from 'styled-components'
import round from 'lodash/round'
import { useTheme as useNivoTheme } from '@nivo/core'
import { useI18n } from 'core/i18n/i18nContext'
import { spacing, fontWeight } from 'core/theme'

const Chip = ({ color, color2 }) => (
    <span className={`Chip Tooltip__Chip ${color2 && 'Chip--split'}`}>
        <span style={{ background: color }} className="Chip__Inner" />
        {color2 && <span style={{ background: color2 }} className="Chip__Inner" />}
    </span>
)

export const FeaturesCirclePackingChartTooltip = (props) => {
    const { translate } = useI18n()
    const { data } = props
    const { name, awareness, usage } = data
    const nivoTheme = useNivoTheme()
    const theme = useTheme()
    const color = theme.colors.ranges.featureSections[data.sectionId]

    return (
        <div style={nivoTheme.tooltip.container}>
            <div>
                <Heading>{name}</Heading>
                <Grid>
                    <Chip color={`${color}50`} />
                    {translate('options.features_simplified.know_it')}
                    <Value>{awareness}</Value>

                    <Chip color={color} />
                    {translate('options.features_simplified.used_it')}
                    <Value>{usage}</Value>

                    <Chip color={`${color}50`} color2={color} />
                    {translate('options.features_simplified.usage_ratio')}
                    <Value>{round((usage / awareness) * 100, 1)}%</Value>
                </Grid>
            </div>
        </div>
    )
}

const Heading = styled.h4`
    margin-bottom: ${spacing(0.25)};
`

const Grid = styled.div`
    display: grid;
    align-items: center;
    grid-template-columns: 12px auto auto;
    column-gap: ${spacing(0.5)};
`

const Value = styled.span`
    font-weight: ${fontWeight('bold')};
`
