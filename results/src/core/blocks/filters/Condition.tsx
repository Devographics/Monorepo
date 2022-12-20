import React from 'react'
import { useI18n } from 'core/i18n/i18nContext'
import { usePageContext } from 'core/helpers/pageContext'

const filters = [
    'company_size',
    'country',
    'gender',
    'industry_sector',
    'race_ethnicity',
    'source',
    'yearly_salary',
    'years_of_experience'
]

const operators = ['eq', 'in', 'nin']

const Series = ({ condition }) => {
    const { id, operator, value } = condition
    const { getString } = useI18n()
    const context = usePageContext()

    const { metadata } = context
    const { keys } = metadata
    const values = keys[id]

    return (
        <div>
            id:
            <select
                onChange={e => {
                    // setField(e.target.value);
                }}
                value={id}
            >
                <option value="" disabled>
                    {getString && getString('explorer.select_item')?.t}
                </option>
                {filters.map(f => (
                    <option key={f} value={f}>
                        {f}
                    </option>
                ))}
            </select>
            operator:
            <select
                onChange={e => {
                    // setField(e.target.value);
                }}
                value={operator}
            >
                <option value="" disabled>
                    {getString && getString('explorer.select_item')?.t}
                </option>
                {operators.map(o => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
            value:
            <select
                onChange={e => {
                    // setField(e.target.value);
                }}
                value={value}
            >
                <option value="" disabled>
                    {getString && getString('explorer.select_item')?.t}
                </option>
                {values.map(v => (
                    <option key={v} value={v}>
                        {v}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default Series
