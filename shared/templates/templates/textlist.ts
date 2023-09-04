import { text } from './text'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

export const textlist: TemplateFunction = options => {
    const id = 'textlist'
    const output: QuestionTemplateOutput = {
        ...text(addQuestionId(options, id))
    }
    // if an option is "lost" in the API, 
    // check shared/templates/node_modules/@devographics/types/outlines.ts
    // and api/src/graphql/typedefs/schema.graphql
    // and shared/helpers/queries.ts
    return output
}
