import { ApiTemplateFunction } from '../../types/surveys'
import { Country } from '@devographics/types'
import countries from '../../data/countries2.yml'
import { getPaths } from '../helpers'

const countriesTyped = countries as Country[]

export const country: ApiTemplateFunction = options => {
    const { question } = options
    const output = {
        id: 'country',
        // dbSuffix: null,
        // dbPath: `${section.id}.${question.id}`,
        options: countriesTyped.map(country => ({ id: country['alpha-3'], label: country.name })),
        ...question
    }
    return { ...output, ...getPaths({ ...options, question: output }) }
}
