import { text } from './text'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'

export const textlist: TemplateFunction = options => {
    const question = { ...options.question, inputComponent: 'textList', allowMultiple: true }
    const output: QuestionTemplateOutput = text({ ...options, question })
    // if an option is "lost" in the API,
    // check shared/templates/node_modules/@devographics/types/outlines.ts
    // and api/src/graphql/typedefs/schema.graphql
    // and shared/helpers/queries.ts
    return output
}
