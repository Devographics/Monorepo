import { TemplateFunction } from '@devographics/types'

export const others: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbSuffix: 'others',
    dbPath: `${section.slug || section.id}.${question?.id?.replace(
        '_others',
        '.others'
    )}.normalized`
})
