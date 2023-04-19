import { ApiTemplateFunction } from '../../types/surveys'
import { Country } from '@devographics/types'
import countries from '../../data/countries2.yml'

const countriesTyped = countries as Country[]

export const country: ApiTemplateFunction = options => {
    const { question } = options
    return {
        id: 'country',
        // dbSuffix: null,
        // dbPath: `${section.id}.${question.id}`,
        options: countriesTyped.map(country => ({ id: country['alpha-3'], label: country.name })),
        normPaths: {
            response: 'user_info.country_alpha3'
        },
        ...question
    }
}
