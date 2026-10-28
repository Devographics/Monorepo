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

export const surveyColorTheme = {
    lightOnDark: {
        primary: { default: '#EA86E7', darker: '#D746D3' },
        background: { default: '#030d1f', alt: '#182a4a', alt2: '#604B81' },
        text: { default: '#ffffff' },
        velocity: [
            'hsl(300, 61%, 20%)',
            'hsl(300, 61%, 25%)',
            'hsl(300, 61%, 30%)',
            'hsl(300, 61%, 35%)',
            'hsl(300, 61%, 40%)',
            'hsl(300, 61%, 45%)',
            'hsl(300, 61%, 50%)',
            'hsl(300, 61%, 55%)',
            'hsl(300, 61%, 60%)',
            'hsl(300, 61%, 65%)',
            'hsl(300, 61%, 70%)',
            'hsl(300, 61%, 75%)',
            'hsl(300, 61%, 80%)',
            'hsl(300, 61%, 85%)'
        ]
    }
}

const commonColors = {
    textAlt: 'rgba(255, 246, 229, 0.5)'
}

const tokyodevThemeColors: DefaultTheme['colors'] = {
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

export default tokyodevThemeColors
