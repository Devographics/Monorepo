import { DefaultTheme } from 'styled-components'
import colors_ from 'core/theme/colors'

const colors = {
    ...colors_,
    tealDarkest: '#167387',
    tealDarker: '#2594AC',
    tealDark: '#2EB1CE',
    teal: '#47CFED',
    tealLight: '#6BDAF2',
    tealLighter: '#92E4F6',
    tealLightest: '#BFF4FF',
    pinkDark: '#9D0E66',
    pink: '#ef4e88',
    pinkLight: '#FE79B4',
    pinkLighter: '#FFADD2',
    pinkLightest: '#FFCEE4',
    redDark: '#c3494e',
    red: '#FE6A6A',
    redLight: '#FF8686',
    redLighter: '#FFA3A3',
    redLightest: '#FFC2C2',
    blue: '#3633B7',
    blueLight: '#775CE0',
    blueLighter: '#B0AEEF',
    blueLightest: '#D0CFF9',
    purpleDarkest: '#3E1A4D',
    purpleDarker: '#532566',
    purpleDark: '#6D3385',
    purple: '#8D4CA8',
    purpleLight: '#A964C6',
    purpleLighter: '#C185DA',
    purpleLightest: '#D5A7E8',
    purpleLightester: '#EFDCF8',
    green: '#4BC77D',
    greenLight: '#73D49A',
    greenLighter: '#B6F4CF',
    white: '#FFF6E6',
    yellowLight: '#FFF1C0',
    yellow: '#FFE589',
    greyDarker: '#303435',
    greyDark: '#4E5557',
    grey: '#8B8085',
    greyLight: '#BBB2B6',
    greyLighter: '#DED1D7',
    greyLightest: '#EADEE3'
}

// const tiers = [colors.red, '#ffc38a', '#ffe38d', '#feff8e', '#c3ff89']
const tiers = [colors.red, '#ffc38a', '#feff8e', '#c3ff89']

const velocity = [
    colors.purpleDarkest,
    colors.purpleDarker,
    colors.purpleDark,
    colors.purple,
    colors.purpleLight,
    colors.purpleLighter,
    colors.purpleLightest,
    colors.tealLightest,
    colors.tealLighter,
    colors.tealLight,
    colors.teal,
    colors.tealDark,
    colors.tealDarker,
    colors.tealDarkest,
]

const arrowsVelocity = [
    colors.purple,
    colors.purpleLight,
    colors.purpleLighter,
    colors.purpleLightest,
    colors.tealLightest,
    colors.tealLighter,
    colors.tealLight,
    colors.teal,
    colors.tealDark,
    colors.tealDarker,
    colors.tealDarkest,
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
    colors.blueLighter
]

const stateOfJSThemeColors: DefaultTheme['colors'] = {
    background: '#272325',
    backgroundBackground: colors.greyDarker,
    backgroundForeground: colors.navyLighter,
    backgroundAlt: colors.greyDarker,
    backgroundAlt2: colors.greyDark,
    backgroundInverted: '#FFF6E6',
    backgroundInvertedAlt: '#E3D8C4',
    text: colors.white,
    textAlt: '#E3D8C4',
    textInverted: '#272325',
    textInvertedAlt: colors.greyDark,
    textHighlight: colors.greenDark,
    textError: colors.redLighter,
    link: colors.teal,
    linkActive: '#5C63E0',
    contrast: '#0bdf67',
    border: '#FFF6E6',
    borderAlt: colors.greyDarker,
    borderAlt2: colors.greyDark,
    heatmap: colors.tealLight,
    lineChartDefaultColor: '#59DF7F',
    lowVelocity: colors.purpleLighter,
    highVelocity: colors.teal,
    barChart: {
        primary: colors.teal,
        primaryGradient: [colors.tealDark, colors.teal],
        // secondary: colors.yellowLight,
        // secondaryGradient: [colors.yellow, colors.yellowLight],
        secondary: colors.purple,
        secondaryGradient: [colors.purple, colors.purpleLighter]
    },
    no_answer: [colors.greyLight, colors.greyLightest],
    ranges: {
        tools: {
            would_use: [colors.teal, colors.tealLight],
            would_not_use: [colors.red, colors.redLight],
            interested: [colors.tealLighter, colors.tealLightest],
            not_interested: [colors.redLighter, colors.redLightest],
            never_heard: [colors.greyLight, colors.greyLightest]
        },
        toolSections: {
            front_end_frameworks: colors.pinkLight,
            back_end_frameworks: colors.purple,
            testing: colors.orange,
            build_tools: colors.teal,
            mobile_desktop: colors.green,
            monorepo_tools: colors.navyLighter
        },
        features: {
            used: [colors.pink, colors.pinkLight],
            heard: [colors.blue, colors.blueLight],
            never_heard: [colors.grey, colors.greyLight]
        },
        features_categories: {
            language: colors.purple,
            browser_apis: colors.pink,
            other_features: colors.green
        },
        features_simplified: {
            know_it: '#ACFFC3',
            used_it: '#59DF7F'
        },
        gender: {
            male: [velocity[0], velocity[1]],
            female: [velocity[3], velocity[4]],
            non_binary: [velocity[6], velocity[7]],
            prefer_not_to_say: [velocity[8], velocity[9]],
            not_listed: [velocity[10], velocity[11]]
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
            range_work_for_free: [velocity[0], velocity[1]],
            range_0_10: [velocity[2], velocity[3]],
            range_10_30: [velocity[4], velocity[5]],
            range_30_50: [velocity[6], velocity[7]],
            range_50_100: [velocity[8], velocity[9]],
            range_100_200: [velocity[10], velocity[11]],
            range_more_than_200: [velocity[12], velocity[13]]
        },
        years_of_experience: {
            range_less_than_1: [velocity[0], velocity[1]],
            range_1_2: [velocity[2], velocity[3]],
            range_2_5: [velocity[4], velocity[5]],
            range_5_10: [velocity[6], velocity[7]],
            range_10_20: [velocity[8], velocity[9]],
            range_more_than_20: [velocity[10], velocity[11]]
        },
        higher_education_degree: {
            no_degree: velocity[0],
            yes_related: velocity[2],
            yes_unrelated: velocity[4]
        },
        opinions: {
            4: [velocity[9], velocity[8]],
            3: [velocity[7], velocity[6]],
            2: [velocity[5], velocity[4]],
            1: [velocity[3], velocity[2]],
            0: [velocity[1], velocity[0]]
        },
        bracket: {
            round1: [velocity[2], velocity[3]],
            round2: [velocity[5], velocity[6]],
            round3: [velocity[10], velocity[11]]
        }
    },
    distinct,
    countries: [velocity[7], velocity[8], velocity[9], velocity[10], velocity[11], velocity[12]],
    velocity,
    arrowsVelocity,
    tiers
}

export default stateOfJSThemeColors
