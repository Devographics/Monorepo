import * as allTemplates from './templates'
const { defaultTemplateFunction } = allTemplates
import { TemplatesDictionnary } from './types'

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
    country: defaultTemplateFunction,

    email2: doNotInclude,
    receive_notifications: doNotInclude,
    help: doNotInclude
}
