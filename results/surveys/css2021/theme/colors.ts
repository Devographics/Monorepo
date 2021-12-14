import { DefaultTheme } from 'styled-components'
import colors_ from 'core/theme/colors'

const colors = {
    ...colors_, 
    pink: '#ef4e88',
    pinkLight: '#FE79B4',
    pinkLighter: '#FFADD2',
    blue: '#3633B7',
    blueLight: '#775CE0',
    blueLighter: '#B0AEEF',
    green: '#4BC77D',
    greenLight: '#73D49A',
    greenLighter: '#B6F4CF',
    lightYellow: '#FFF6E6',
    yellow: '#FFE589',
}

const velocity = [
    '#1734BF',
    '#3633B7',
    '#5432AE',
    '#7331A6',
    '#91319D',
    '#B03095',
    '#CE2F8C',
    '#ED2E84',
    '#FB549F',
    '#FE79B4',
    '#FFA6CE',
    '#FFCEE4'
]

const distinct = [
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
    colors.purple,
    colors.blueLighter,
]

const stateOfCSSThemeColors: DefaultTheme['colors'] = {
    background: '#272325',
    backgroundBackground: '#3E3036',
    backgroundForeground: colors.navyLighter,
    backgroundAlt: '#3E3036',
    backgroundAlt2: '#5F4C54',
    backgroundInverted: '#FFF6E6',
    backgroundInvertedAlt: '#E3D8C4',
    text: colors.lightYellow,
    textAlt: '#E3D8C4',
    textInverted: '#272325',
    textHighlight: colors.greenDark,
    link: colors.pink,
    linkActive: '#5C63E0',
    contrast: '#0bdf67',
    border: '#FFF6E6',
    heatmap: colors.pinkLight,
    lineChartDefaultColor: '#59DF7F',
    barChart: {
        primary: colors.pink,
        primaryGradient: ['#9D0E66', colors.pink],
        secondary: colors.lightYellow,
        secondaryGradient: ['#FCEDB9', colors.pink],
    },
    ranges: {
        tools: {
            would_use: colors.blue,
            would_not_use: colors.pink,
            interested: colors.blueLighter,
            not_interested: colors.pinkLighter,
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
            pre_post_processors: colors.yellow,
            css_frameworks: colors.pink
        },
        features: {
            used: colors.pink,
            heard: colors.blue,
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
            male: velocity[0],
            female: velocity[2],
            non_binary: velocity[4],
            prefer_not_to_say: velocity[6],
            not_listed: velocity[8]
        },
        race_ethnicity: {
            biracial: velocity[0],
            black_african: velocity[1],
            east_asian: velocity[2],
            hispanic_latin: velocity[3],
            middle_eastern: velocity[4],
            multiracial: velocity[5],
            native_american_islander_australian: velocity[6],
            south_asian: velocity[7],
            white_european: velocity[8],
            south_east_asian: velocity[9],
            not_listed: velocity[10]
        },
        yearly_salary: {
            range_work_for_free: velocity[0],
            range_0_10: velocity[1],
            range_10_30: velocity[2],
            range_30_50: velocity[3],
            range_50_100: velocity[4],
            range_100_200: velocity[5],
            range_more_than_200: velocity[6]
        },
        years_of_experience: {
            range_less_than_1: velocity[0],
            range_1_2: velocity[2],
            range_2_5: velocity[4],
            range_5_10: velocity[6],
            range_10_20: velocity[8],
            range_more_than_20: velocity[10]
        },
        higher_education_degree: {
            no_degree: velocity[0],
            yes_related: velocity[2],
            yes_unrelated: velocity[4]
        },
        opinions: {
            4: velocity[8],
            3: velocity[6],
            2: velocity[4],
            1: velocity[2],
            0: velocity[0],
        },
        bracket: {
            round1: velocity[3],
            round2: velocity[5],
            round3: velocity[7]
        }
    },
    distinct,
    countries: [
        colors.blue,
        colors.blueLight,
        colors.blueLighter,
        colors.pinkLightest,
        colors.pinkLighter,
        colors.pinkLight,
        colors.pink
    ],
    velocity
}

export default stateOfCSSThemeColors
