import { ApiTemplateFunction, TransformFunction } from '../../types/surveys'

const groups = [
    {
        id: 'range_under_2999999',
        average: 1500000,
        items: ['range_under_1000000', 'range_1000000_to_1999999', 'range_2000000_to_2999999']
    },
    {
        id: 'range_3000000_to_5999999',
        average: 4500000,
        items: ['range_3000000_to_3999999', 'range_4000000_to_4999999', 'range_5000000_to_5999999']
    },
    {
        id: 'range_6000000_to_8999999',
        average: 7500000,
        items: ['range_6000000_to_6999999', 'range_7000000_to_7999999', 'range_8000000_to_8999999']
    },
    {
        id: 'range_9000000_to_11999999',
        average: 10500000,
        items: [
            'range_9000000_to_9999999',
            'range_10000000_to_10999999',
            'range_11000000_to_11999999'
        ]
    },
    {
        id: 'range_12000000_to_14999999',
        average: 13500000,
        items: [
            'range_12000000_to_12999999',
            'range_13000000_to_13999999',
            'range_14000000_to_14999999'
        ]
    },
    {
        id: 'range_15000000_to_19999999',
        average: 17500000,
        items: [
            'range_15000000_to_15999999',
            'range_16000000_to_16999999',
            'range_17000000_to_17999999',
            'range_18000000_to_18999999',
            'range_19000000_to_19999999'
        ]
    },
    {
        id: 'range_over_20000000',
        average: 20000000,
        items: [
            'range_20000000_to_20999999',
            'range_21000000_to_21999999',
            'range_22000000_to_22999999',
            'range_23000000_to_23999999',
            'range_24000000_to_24999999',
            'range_25000000_to_25999999',
            'range_26000000_to_26999999',
            'range_27000000_to_27999999',
            'range_28000000_to_28999999',
            'range_29000000_to_29999999',
            'range_30000000_or_more'
        ]
    }
]

export const current_total_annual_compensation_grouped: ApiTemplateFunction = options => ({
    id: 'current_total_annual_compensation_grouped',
    normPaths: {
        response: 'compensation.current_total_annual_compensation.choices'
    },
    groups,
    defaultSort: 'options',
    options: groups,
    optionsAreSequential: true,
    optionsAreRange: true,
    ...options.question
})
