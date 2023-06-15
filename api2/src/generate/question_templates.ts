import * as allTemplates from './templates/index'
const { defaultTemplateFunction } = allTemplates
import { TemplatesDictionnary } from '../types/surveys'

const doNotInclude = () => ({
    hasApiEndpoint: false
})

export const templates: TemplatesDictionnary = {
    ...allTemplates,

    top_n: allTemplates.multiple,

    bracket: defaultTemplateFunction,
    text: defaultTemplateFunction,
    longtext: defaultTemplateFunction,

    receive_notifications: doNotInclude,
    help: doNotInclude
}
