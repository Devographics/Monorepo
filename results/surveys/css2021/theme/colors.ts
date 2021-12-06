import { DefaultTheme } from 'styled-components'
import colors from 'core/theme/colors'

const stateOfCSSThemeColors: DefaultTheme['colors'] = {
    background: '#272325',
    backgroundBackground: '#3E3036',
    backgroundForeground: colors.navyLighter,
    backgroundAlt: '#3E3036',
    backgroundAlt2: '#3E3036',
    backgroundInverted: colors.greyTeal,
    backgroundInvertedAlt: '#FBFAE1',
    text: '#FFF6E6',
    textAlt: '#CCC2AF',
    textInverted: colors.navyDark,
    textHighlight: colors.greenDark,
    link: '#ED2E84',
    linkActive: '#1734BF',
    contrast: '#0bdf67',
    border: '#FFF6E6',
    heatmap: colors.pinkLight,
    lineChartDefaultColor: '#59DF7F',
    barChart: {
        primary: '#ED2E84',
        secondary: '#556ad7'
    },
    ranges: {
        tools: {
            would_use: '#59DF7F',
            would_not_use: colors.pink,
            interested: '#ACFFC3',
            not_interested: colors.pinkLight,
            never_heard: '#59608a'
        },
        toolSections: {
            javascript_flavors: colors.indigo,
            front_end_frameworks: colors.pink,
            datalayer: colors.red,
            back_end_frameworks: colors.purple,
            testing: colors.orange,
            build_tools: colors.yellow,
            mobile_desktop: colors.green,
            other_tools: colors.blue,
            css_in_js: colors.blue,
            pre_post_processors: colors.purple,
            css_frameworks: colors.green
        },
        features: {
            used: colors.blue,
            heard: colors.greyTeal,
            never_heard: colors.navyLighter
        },
        features_categories: {
            layout: colors.indigo,
            shapes_graphics: colors.pink,
            interactions: colors.red,
            typography: colors.purple,
            animations_transforms: colors.orange,
            other_features: colors.green,
            accessibility: colors.yellow
        },
        features_simplified: {
            know_it: '#ACFFC3',
            used_it: '#59DF7F'
        },
        gender: {
            male: colors.blue,
            female: colors.teal,
            non_binary: colors.red,
            prefer_not_to_say: colors.greyMediumer,
            not_listed: colors.greyMedium,
        },
        opinions: {
            4: colors.pink,
            3: colors.pinkLight,
            2: '#59608a',
            1: colors.blueLight,
            0: colors.blue
        },
        bracket: {
            round1: '#7331A6',
            round2: '#B03095',
            round3: '#ED2E84'
        }
    },
    distinct: [
        colors.indigo,
        colors.teal,
        colors.pink,
        colors.red,
        colors.green,
        colors.yellow,
        colors.aqua,
        colors.orange,
        colors.olive,
        colors.skyblue,
        colors.purple
    ],
    countries: [
        colors.blue,
        colors.blueLight,
        colors.blueLighter,
        colors.pinkLightest,
        colors.pinkLighter,
        colors.pinkLight,
        colors.pink
    ],
    velocity: [
        '#1734BF',
        '#3633B7',
        '#5432AE',
        '#7331A6',
        '#91319D',
        '#B03095',
        '#CE2F8C',
        '#ED2E84'
    ]
}

export default stateOfCSSThemeColors
