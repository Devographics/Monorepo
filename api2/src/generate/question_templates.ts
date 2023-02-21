import * as allTemplates from './templates'
const { defaultTemplateFunction } = allTemplates

const doNotInclude = () => ({
    includeInApi: false
})

export const templates = {
    ...allTemplates,

    opinion: defaultTemplateFunction,
    bracket: defaultTemplateFunction,
    text: defaultTemplateFunction,
    longtext: defaultTemplateFunction,
    slider: defaultTemplateFunction,
    race_ethnicity: defaultTemplateFunction,
    country: defaultTemplateFunction,
    top_n: defaultTemplateFunction,

    email2: doNotInclude,
    receive_notifications: doNotInclude,
    help: doNotInclude
}
