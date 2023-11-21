import questionOptions from '../options.yml'
import { DbSuffixes, TemplateFunction } from '@devographics/types'
import { getPaths } from '../helpers'

export const yearly_salary_v2: TemplateFunction = options => {
    const id = 'yearly_salary_v2'
    const question = {
        id,
        inputComponent: 'single',
        allowMultiple: false,
        ...questionOptions[id],
        ...options.question
    }
    const output = {
        ...getPaths({ ...options, question }, DbSuffixes.CHOICES),
        ...question
    }
    return output
}
