/**
 * TODO: make this not hardcoded
 * To achieve that, load possible source from db or a config file on github
 * before generating the API graphql schema
 */
import { QuestionTemplateOutput, TemplateFunction } from '@devographics/types'
import { DbSuffixes } from '@devographics/types'

/**
 * Sources are meant to be added in the yml config file of each edition
 */
export const source: TemplateFunction = ({ survey, edition, question, section }) => {
    const options = edition.sources || []
    if (options.length === 0) {
        console.warn(`Survey ${edition?.id} has no sources`)
    }
    const output: QuestionTemplateOutput = {
        id: 'source',
        options,
        normPaths: {
            other: `user_info.source.${DbSuffixes.NORMALIZED}`
        },
        ...question
    }
    return output
}
