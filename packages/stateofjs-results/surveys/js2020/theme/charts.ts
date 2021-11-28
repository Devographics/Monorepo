import { DefaultTheme } from 'styled-components'
import defaultsDeep from 'lodash/defaultsDeep'
import charts from 'core/theme/charts'
import baseColors from 'core/theme/colors'
import colors from './colors'
import typography from './typography'

const stateOfJSThemeCharts: DefaultTheme['charts'] = defaultsDeep(
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
                    stroke: baseColors.greyLight,
                },
                text: {
                    fill: baseColors.greyLight,
                },
            },
        },
        grid: {
            line: {
                stroke: baseColors.greyMedium,
            },
        },
        legends: {
            text: {
                fill: baseColors.greyLight,
            },
        },
        tooltip: {
            container: {
                background: baseColors.greyLight,
                color: baseColors.blueDark,
            },
        },
        labels: {
            text: {
                fill: baseColors.navyDark,
            },
        },
        dots: {
            text: {
                fill: baseColors.greyDark,
            },
        },
    },
    charts
)

export default stateOfJSThemeCharts
