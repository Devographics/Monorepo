import * as allTemplates from './templates'
import { TemplateFunction } from './types'
const { defaultTemplateFunction } = allTemplates

const doNotInclude = () => ({
    includeInApi: false
})

const slider: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id}.choices`
})

export const templates = {
    ...allTemplates,

    opinion: defaultTemplateFunction,
    bracket: defaultTemplateFunction,
    text: defaultTemplateFunction,
    longtext: defaultTemplateFunction,
    slider,
    race_ethnicity: defaultTemplateFunction,
    country: defaultTemplateFunction,
    top_n: defaultTemplateFunction,

    email2: doNotInclude,
    receive_notifications: doNotInclude,
    help: doNotInclude
}
