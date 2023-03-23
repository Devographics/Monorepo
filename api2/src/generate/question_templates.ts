import * as allTemplates from './templates/index'
const { defaultTemplateFunction } = allTemplates
import { TemplatesDictionnary } from '../types/surveys'

const doNotInclude = () => ({
    includeInApi: false
})

export const templates: TemplatesDictionnary = {
    ...allTemplates,

    race_ethnicity: allTemplates.multiple,
    top_n: allTemplates.multiple,

    bracket: defaultTemplateFunction,
    text: defaultTemplateFunction,
    longtext: defaultTemplateFunction,

    email2: doNotInclude,
    receive_notifications: doNotInclude,
    help: doNotInclude
}
