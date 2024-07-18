import { DefaultTheme } from 'styled-components'
import defaultsDeep from 'lodash/defaultsDeep'
import charts from 'core/theme/charts'
import baseColors from 'core/theme/colors'
import colors from './colors'
import typography from './typography'

const stateOfCSSThemeCharts: DefaultTheme['charts'] = defaultsDeep(
    {
        fontFamily: typography.fontFamily,
        axis: {
            ticks: {
                line: {
                    fill: colors.text,
                },
                text: {
                    fill: colors.text,
                },
            },
            legend: {
                text: {
                    fill: colors.text,
                },
            },
        },
        streamTimelineAxis: {
            ticks: {
                line: {
                    stroke: colors.text,
                },
                text: {
                    fill: colors.text,
                },
            },
        },
        tooltip: {
            container: {
                fontSize: 14,
                background: baseColors.greyLight,
                color: baseColors.blueDark,
                borderRadius: 0,
                boxShadow: `9px 9px 0 rgba(0, 0, 0, 0.15)`,
            },
        },
        legends: {
            text: {
                fill: colors.text,
            },
        },
    },
    charts
)

export default stateOfCSSThemeCharts
