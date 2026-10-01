/**
 * Survey logos keyed by survey id
 *
 * Imports the logo files directly (rather than via ./icons/index)
 * so consumers don't pull in IconWrapper and its styled-components dependency
 */
import { StateOfAIIcon } from './icons/StateOfAI'
import { StateOfCSSIcon } from './icons/StateOfCSS'
import { StateOfDevsIcon } from './icons/StateOfDevs'
import { StateOfHTMLIcon } from './icons/StateOfHTML'
import { StateOfJSIcon } from './icons/StateOfJS'
import { StateOfReactIcon } from './icons/StateOfReact'

export const surveyIcons = {
    state_of_js: StateOfJSIcon,
    state_of_css: StateOfCSSIcon,
    state_of_html: StateOfHTMLIcon,
    state_of_ai: StateOfAIIcon,
    state_of_devs: StateOfDevsIcon,
    state_of_react: StateOfReactIcon
}

export const getSurveyIcon = (surveyId: string) =>
    surveyIcons[surveyId as keyof typeof surveyIcons]
