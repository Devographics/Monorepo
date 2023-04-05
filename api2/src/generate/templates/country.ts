import { TemplateFunction } from '../../types/surveys'
import { Country } from '../../types/demographics'
import countries from '../../data/countries2.yml'

const countriesTyped = countries as Country[]

export const country: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbPath: `${section.id}.${question.id}`,
    options: countriesTyped.map(country => ({ id: country['alpha-3'], label: country.name }))
})
