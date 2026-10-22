import { DefaultTheme } from 'styled-components'
import colors_ from 'core/theme/colors'
import { getThemeColor } from 'core/theme_new/colors'

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

const velocity = [
    '#173E48',
    '#064151',
    '#074B5C',
    '#07657D',
    '#0F7C98',
    '#129DC0',
    '#21B1D6',
    '#38D6FE',
    '#67E0FF',
    '#AEEFFF',
    '#D3F6FF',
    '#E5FFFA',
    '#BCFFF3',
    '#9FFFEE',
    '#9FFFBA',
    '#61F99E',
    '#37EF80',
    '#15ED6B',
    '#06DF0E',
    '#0ECC16',
    '#0AB411',
    '#089F0E',
    '#068A0B'
]

// const velocity = [
//     '#1734BF',
//     '#3633B7',
//     '#5432AE',
//     '#7331A6',
//     '#91319D',
//     '#B03095',
//     '#CE2F8C',
//     '#ED2E84',
//     '#FB549F',
//     '#FE79B4',
//     '#FFA6CE',
//     '#FFCEE4',
//     '#FFE3F0',
//     '#FFEFFF'
// ]

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

export const surveyColorTheme = {
    lightOnDark: {
        primary: { default: '#BB92F0', darker: '#8B45E7' },
        background: { default: '#302B32', alt: '#514057', alt2: '#765183' },
        text: { default: '#E9DCED' },
        experience: {
            heard: 'rgb(166, 174, 245)',
            used: 'rgb(51, 32, 175)',
            never_heard: 'rgb(131, 128, 139)'
        },
        sentiment: {
            positive: 'rgb(92, 229, 186)',
            negative: 'rgb(255, 95, 119)',
            neutral: 'rgb(128, 137, 139)'
        },
        velocity: [
            'hsl(267, 60%, 20%)',
            'hsl(267, 60%, 25%)',
            'hsl(267, 60%, 30%)',
            'hsl(267, 60%, 35%)',
            'hsl(267, 60%, 40%)',
            'hsl(267, 60%, 45%)',
            'hsl(267, 60%, 50%)',
            'hsl(267, 60%, 55%)',
            'hsl(267, 60%, 60%)',
            'hsl(267, 60%, 65%)',
            'hsl(267, 60%, 70%)',
            'hsl(267, 60%, 75%)',
            'hsl(267, 60%, 80%)',
            'hsl(267, 100%, 85%)'
        ]
    }
}
const commonColors = {
    textAlt: 'rgba(255, 246, 229, 0.5)'
}

const stateOfHtmlThemeColors: DefaultTheme['colors'] = {
    ...commonColors,
    background: getThemeColor('background.default'),
    backgroundAlt: getThemeColor('background.alt'),
    backgroundAlt2: getThemeColor('background.alt2'),
    text: getThemeColor('text.default'),

    link: getThemeColor('primary.default'),
    no_answer: [colors.greyLight, colors.greyLightest],
    border: '#FFF6E6',
    velocityBarColors: velocity.map((color, i) => ({
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
        color: colors.blueGreenDark,
        gradient: [colors.blueGreenDark, colors.blueGreenDark]
    },
    barColorNoAnswer: {
        id: 'barColorNoAnswer',
        color: colors.greyLight,
        gradient: [colors.greyLight, colors.greyLightest]
    },
    barChart: {
        primary: getThemeColor('primary.default'),
        primaryGradient: [getThemeColor('primary.darker'), getThemeColor('primary.default')],
        // secondary: colors.yellowLight,
        // secondaryGradient: [colors.yellow, colors.yellowLight],
        secondary: colors.pink,
        secondaryGradient: [colors.pinkDark, colors.pink]
    },
    ranges: {
        sentiment: {
            positive: [getThemeColor('sentiment.positive'), getThemeColor('sentiment.positive')],
            neutral: [getThemeColor('sentiment.neutral'), getThemeColor('sentiment.neutral')],
            negative: [getThemeColor('sentiment.negative'), getThemeColor('sentiment.negative')]
        },
        features: {
            heard: [getThemeColor('experience.heard'), getThemeColor('experience.heard')],
            used: [getThemeColor('experience.used'), getThemeColor('experience.used')],
            never_heard: [
                getThemeColor('experience.never_heard'),
                getThemeColor('experience.never_heard')
            ]
        },
        opinions: {
            4: [getThemeColor('velocity[9]'), getThemeColor('velocity[8]')],
            3: [getThemeColor('velocity[7]'), getThemeColor('velocity[6]')],
            2: [getThemeColor('velocity[5]'), getThemeColor('velocity[4]')],
            1: [getThemeColor('velocity[3]'), getThemeColor('velocity[2]')],
            0: [getThemeColor('velocity[1]'), getThemeColor('velocity[0]')]
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

export default stateOfHtmlThemeColors
