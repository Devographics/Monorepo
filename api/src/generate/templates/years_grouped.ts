import { ApiTemplateFunction } from '../../types/surveys'

const groups = [
    {
        id: 'range_under_1',
        lowerBound: 0,
        average: 1,
        upperBound: 1
    },
    {
        id: 'range_1_3',
        lowerBound: 1,
        upperBound: 4
    },
    {
        id: 'range_4_6',
        lowerBound: 4,
        upperBound: 7
    },
    {
        id: 'range_7_9',
        lowerBound: 7,
        upperBound: 10
    },
    {
        id: 'range_10_12',
        lowerBound: 10,
        upperBound: 13
    },
    {
        id: 'range_13_15',
        lowerBound: 13,
        upperBound: 16
    },
    {
        id: 'range_16_20',
        lowerBound: 16,
        upperBound: 20
    },
    {
        id: 'range_over_20',
        lowerBound: 20,
        average: 20
    }
]

/*

Note: normPath should be defined by question in api.yml. For example:

    normPaths: {
        response: 'user_info.years_of_experience.choices'
    },

*/

export const years_grouped: ApiTemplateFunction = options => ({
    id: 'placeholder',
    groups,
    defaultSort: 'options',
    options: groups,
    optionsAreSequential: true,
    optionsAreRange: true,
    ...options.question
})
