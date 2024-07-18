// not used?
import { ApiTemplateFunction, TransformFunction } from '../../types/surveys'

/*

Note: upper bounds are non-inclusive, so upper bound for group "range_20_24" is
"everything under 25, but not 25" e.g. 24, 24.5, 24.9999, etc. 

*/
const groups = [
    {
        id: 'range_under_20',
        lowerBound: 0,
        average: 17.5,
        upperBound: 20
    },
    {
        id: 'range_20_24',
        lowerBound: 20,
        upperBound: 25
    },
    {
        id: 'range_25_29',
        lowerBound: 25,
        upperBound: 30
    },
    {
        id: 'range_30_34',
        lowerBound: 30,
        upperBound: 35
    },
    {
        id: 'range_35_39',
        lowerBound: 35,
        upperBound: 40
    },
    {
        id: 'range_40_44',
        lowerBound: 40,
        upperBound: 45
    },
    {
        id: 'range_45_49',
        lowerBound: 45,
        upperBound: 50
    },
    {
        id: 'range_50_54',
        lowerBound: 50,
        upperBound: 55
    },
    {
        id: 'range_55_59',
        lowerBound: 55,
        upperBound: 60
    },
    {
        id: 'range_60_64',
        lowerBound: 60,
        upperBound: 65
    },
    {
        id: 'range_65_69',
        lowerBound: 65,
        upperBound: 70
    },
    {
        id: 'range_over_70',
        lowerBound: 70,
        average: 75
    }
]

export const age_grouped: ApiTemplateFunction = options => ({
    id: 'age_grouped',
    normPaths: {
        response: 'user_info.age.choices'
    },
    groups,
    defaultSort: 'options',
    options: groups,
    optionsAreSequential: true,
    optionsAreRange: true,
    ...options.question
})
