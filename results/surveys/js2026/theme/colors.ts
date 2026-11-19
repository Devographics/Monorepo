import { SurveyColorTheme } from 'core/theme_new/types'
import { baseColors } from 'core/theme_new/base_colors'

export const surveyColorTheme: SurveyColorTheme = {
    lightOnDark: {
        primary: { default: '#8AC6FF', darker: '#3B81C4' },
        background: {
            default: '#2E3134',
            alt: '#3A4957',
            alt2: '#3F5D79'
        },
        text: {
            default: '#E4EFF9'
        },
        experience: {
            heard: 'rgb(166, 220, 245)',
            used: 'rgb(94, 160, 204)',
            never_heard: 'rgb(128, 135, 139)'
        },
        sentiment: {
            positive: 'rgb(92, 229, 186)',
            negative: 'rgb(255, 95, 119)',
            neutral: 'rgb(128, 135, 139)'
        },
        velocity: [
            'hsl(207, 61%, 20%)',
            'hsl(207, 60%, 25%)',
            'hsl(207, 60%, 30%)',
            'hsl(207, 60%, 35%)',
            'hsl(207, 60%, 40%)',
            'hsl(207, 60%, 45%)',
            'hsl(207, 60%, 50%)',
            'hsl(207, 60%, 55%)',
            'hsl(207, 60%, 60%)',
            'hsl(207, 60%, 65%)',
            'hsl(207, 60%, 70%)',
            'hsl(207, 60%, 75%)',
            'hsl(207, 60%, 80%)',
            'hsl(207, 100%, 85%)'
        ],
        sections: {
            front_end_frameworks: baseColors.indigo,
            meta_frameworks: baseColors.teal,
            back_end_frameworks: baseColors.red,
            testing: baseColors.green,
            build_tools: baseColors.yellow
        }
    }
}
