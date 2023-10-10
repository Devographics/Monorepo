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
        average: 2,
        upperBound: 3
    },
    {
        id: 'range_4_6',
        lowerBound: 4,
        average: 5,
        upperBound: 6
    },
    {
        id: 'range_7_9',
        lowerBound: 7,
        average: 8,
        upperBound: 9
    },
    {
        id: 'range_10_12',
        lowerBound: 10,
        average: 11,
        upperBound: 12
    },
    {
        id: 'range_13_15',
        lowerBound: 13,
        average: 14,
        upperBound: 15
    },
    {
        id: 'range_16_20',
        lowerBound: 16,
        average: 18,
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
