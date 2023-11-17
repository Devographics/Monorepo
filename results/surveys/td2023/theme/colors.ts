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
    greyLightest: '#EADEE3',

    kakiDark: '#9ca033',
    kaki: '#CCD133',
    electricBlueLight: '#AEF0FF',
    electricBlue: '#38D6FE',
    electricBlueDark: '#21B1D6',
    electricBlueDarker: '#129DC0',
    electricBlueDarkerer: '#07657D',
    electricBlueDarkest: '#224149',
    electricBlueDarkestest: '#0C2B33',
    electricBlueMuted1: '#314448',
    orangeLight: '#FFBA53',
    orange: '#EC9C23',
    orangeDark: '#D98C18',
    orangeDarker: '#BE780F',
    yellowDark: '#ECCB55',
    yellowDarker: '#D2AA19',

    blueGreenLightest: '#C9FFF2',
    blueGreenLighter: '#A1FFE8',
    blueGreenLight: '#75FBDA',
    blueGreen: '#51F2CB',
    blueGreenDark: '#34E1B7',
    blueGreenDarker: '#23D2A8',
    blueGreenDarkest: '#16AF8A',

    lilacLighter: '#E9DCFF',
    lilacLight: '#DCC7FF',
    lilac: '#BD95FF',
    lilacDark: '#B896EF',
    lilacDarker: '#A17AE0',
    lilacDarkerer: '#815CBF',
    lilacDarkest: '#6A499D',
    lilacDarkest2: '#604B81',
    lilacDarkest3: '#503E6A',
    lilacDarkest4: '#3A3444'
}

// const velocity = [
//     '#44168E',
//     '#491D90',
//     '#6532B7',
//     '#A17AE0',
//     '#AD84EF',
//     '#CAAAFF',
//     '#DCC7FF',
//     '#E9DCFF',
//     '#F8DCFF',
//     '#FFB5F3',
//     '#F494E5',
//     '#F176DD',
//     '#EF55D6',
//     '#DE35C3'
// ]

const velocity = [
    '#06513F',
    '#087258',
    '#0C8C6D',
    '#16AF8A',
    '#23D2A8',
    '#34E1B7',
    '#51F2CB',
    '#75FBDA',
    '#A1FFE8',
    '#C9FFF2',
    '#c9f7ff',
    '#d7e7fe',
    '#E9DCFF',
    '#DCC7FF',
    '#CAAAFF',
    '#AD84EF',
    '#8e5ddb',
    '#6b36bf'
]

const arrowsVelocity = [
    '#AD84EF',
    '#CAAAFF',
    '#DCC7FF',
    '#E9DCFF',
    '#C9FFF2',
    '#A1FFE8',
    '#75FBDA',
    '#51F2CB',
    '#34E1B7',
    '#23D2A8',
    '#16AF8A'
]

const tiers = [colors.red, '#ffc38a', '#feff8e', '#c3ff89']

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
    colors.greyTeal,
    colors.kaki
]

const stateOfJSThemeColors: DefaultTheme['colors'] = {
    background: '#030d1f',
    backgroundTrans: 'rgb(39, 35, 37, 0.3)',
    backgroundAlt3: '#182a4a',
    backgroundBackground: '#182a4a',
    backgroundForeground: colors.navyLighter,
    backgroundAlt: '#182a4a',
    backgroundAltTrans: 'rgba(49, 68, 72, 0.4)',
    backgroundAlt2: colors.lilacDarkest2,
    backgroundInverted: '#FFF6E6',
    backgroundInvertedAlt: '#E3D8C4',
    text: colors.white,
    textAlt: 'rgba(255, 246, 229, 0.65)',
    textInverted: '#272325',
    textHighlight: colors.yellowDarker,
    link: '#818cf8',
    linkActive: '#4E46DD',
    contrast: '#4E46DD',
    border: '#FFF6E6',
    borderAlt: 'rgba(255, 246, 229, 0.35)',
    heatmap: colors.pinkLight,
    lineChartDefaultColor: 'rgb(65, 181, 231)',
    no_answer: [colors.greyLight, colors.greyLightest],
    velocityBarColors: velocity.slice(0, Math.round(velocity.length / 2 - 1)).map((color, i) => ({
        id: `velocityColor${i}`,
        color: velocity[i * 2],
        gradient: [velocity[i * 2 + 1], velocity[i * 2]]
    })),
    // bar colors for variants when using filters and (especially) facets
    barColors: [
        {
            id: 'barColor1',
            color: colors.purple,
            gradient: [colors.purple, colors.purpleLighter]
        },
        {
            id: 'barColor2',
            color: colors.pink,
            gradient: [colors.pinkDark, colors.pink]
        },
        {
            id: 'barColor3',
            color: colors.yellow,
            gradient: [colors.yellowDark, colors.yellow]
        },
        {
            id: 'barColor4',
            color: colors.greyTeal,
            gradient: [colors.greyTeal, colors.greyTealLight]
        },
        {
            id: 'barColor5',
            color: colors.olive,
            gradient: [colors.oliveDark, colors.olive]
        },
        {
            id: 'barColor6',
            color: colors.orange,
            gradient: [colors.orangeDarker, colors.orangeLight]
        },
        {
            id: 'barColor7',
            color: colors.aqua,
            gradient: [colors.aquaDark, colors.aqua]
        },
        {
            id: 'barColor8',
            color: colors.red,
            gradient: [colors.redDark, colors.red]
        },
        {
            id: 'barColor9',
            color: colors.skyblue,
            gradient: [colors.skyblueDark, colors.skyblue]
        },
        {
            id: 'barColor10',
            color: colors.kaki,
            gradient: [colors.kakiDark, colors.kaki]
        },
        {
            id: 'barColor11',
            color: colors.green,
            gradient: [colors.greenDark, colors.green]
        }
    ],
    barColorDefault: {
        id: 'barColorDefault',
        color: '#818cf8',
        gradient: ['#818cf8', '#4039BD']
    },
    barColorOverall: {
        id: 'barColorOverall',
        color: '#F99C61',
        gradient: ['#F99C61', '#D76B26']
    },
    barColorNoAnswer: {
        id: 'barColorNoAnswer',
        color: colors.greyLight,
        gradient: [colors.greyLight, colors.greyLightest]
    },
    barChart: {
        primary: colors.blueGreenDark,
        primaryGradient: [colors.blueGreenDarker, colors.blueGreenDark],
        // secondary: colors.yellowLight,
        // secondaryGradient: [colors.yellow, colors.yellowLight],
        secondary: colors.pink,
        secondaryGradient: [colors.pinkDark, colors.pink]
    },
    ranges: {
        tools: {
            would_use: [colors.blueGreenDarker, colors.blueGreenDark],
            would_not_use: [colors.red, colors.redLight],
            interested: [colors.blueGreen, colors.blueGreenLight],
            not_interested: [colors.redLighter, colors.redLightest],
            never_heard: [colors.greyLight, colors.greyLightest]
        },
        toolSections: {
            front_end_frameworks: colors.pinkLight,
            rendering_frameworks: colors.purple,
            testing: colors.orange,
            build_tools: colors.teal,
            mobile_desktop: colors.green,
            monorepo_tools: colors.navyLighter
        },
        features: {
            used: [colors.lilacDarkest, colors.lilacDarkerer],
            heard: [colors.lilacDark, colors.lilac],
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
            round3: [velocity[7], velocity[8]]
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
    velocity,
    arrowsVelocity,
    tiers
}

export default stateOfJSThemeColors
