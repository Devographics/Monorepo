import { SurveyColorTheme } from 'core/theme_new/types'
import { baseColors } from 'core/theme_new/base_colors'

export const surveyColorTheme: SurveyColorTheme = {
    lightOnDark: {
        primary: { default: '#BB92F0', darker: '#8B45E7' },
        background: {
            default: '#302B32',
            alt: '#514057',
            alt2: '#765183'
        },
        text: {
            default: '#E9DCED'
        },
        experience: {
            heard: 'rgb(166, 174, 245)',
            used: 'rgb(109, 94, 204)',
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
        ],
        sections: {
            forms: baseColors.indigo,
            content: baseColors.teal,
            interactivity: baseColors.red,
            performance: baseColors.green,
            web_components: baseColors.yellow,
            system_capabilities: baseColors.pink,
            accessibility: baseColors.purple
        }
    }
}
