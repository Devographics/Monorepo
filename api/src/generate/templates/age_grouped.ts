import { ApiTemplateFunction, TransformFunction } from '../../types/surveys'

const groups = [
    {
        id: 'range_under_20',
        lowerBound: 0,
        average: 17,
        upperBound: 19
    },
    {
        id: 'range_20_24',
        lowerBound: 20,
        average: 22,
        upperBound: 24
    },
    {
        id: 'range_25_29',
        lowerBound: 25,
        average: 27,
        upperBound: 29
    },
    {
        id: 'range_30_34',
        lowerBound: 30,
        average: 32,
        upperBound: 34
    },
    {
        id: 'range_35_39',
        lowerBound: 35,
        average: 37,
        upperBound: 39
    },
    {
        id: 'range_40_44',
        lowerBound: 40,
        average: 42,
        upperBound: 44
    },
    {
        id: 'range_45_49',
        lowerBound: 45,
        average: 47,
        upperBound: 49
    },
    {
        id: 'range_50_54',
        lowerBound: 50,
        average: 52,
        upperBound: 54
    },
    {
        id: 'range_55_59',
        lowerBound: 55,
        average: 57,
        upperBound: 59
    },
    {
        id: 'range_60_64',
        lowerBound: 60,
        average: 62,
        upperBound: 64
    },
    {
        id: 'range_65_69',
        lowerBound: 64,
        average: 67,
        upperBound: 69
    },
    {
        id: 'range_over_70',
        lowerBound: 70,
        average: 72
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
