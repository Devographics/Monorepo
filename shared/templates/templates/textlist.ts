import { text } from './text'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'

// TODO: the name of the template seem to matter, be carefull with the casing
export const textList: TemplateFunction = options => {
    const question = { ...options.question, inputComponent: 'textList', allowMultiple: true }
    const output: QuestionTemplateOutput = text({ ...options, question })
    // A text list is a list so it handle arrays => allowMultiple must be true
    output.allowMultiple = true
    // if an option is "lost" in the API,
    // check shared/templates/node_modules/@devographics/types/outlines.ts
    // and api/src/graphql/typedefs/schema.graphql
    // and shared/helpers/queries.ts
    return output
}
