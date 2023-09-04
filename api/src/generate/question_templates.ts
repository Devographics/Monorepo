import { defaultTemplateFunction, templateFunctions } from '@devographics/templates'
import * as apiTemplateFunctions from './templates/index'
import { TemplatesDictionnary } from '../types/surveys'

const doNotInclude = () => ({
    hasApiEndpoint: false
})

export const templates: TemplatesDictionnary = {
    ...templateFunctions,
    ...apiTemplateFunctions,

    top_n: templateFunctions.multiple,

    bracket: defaultTemplateFunction,

    receive_notifications: doNotInclude,
    help: doNotInclude
}
