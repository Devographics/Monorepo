import { DbSuffixes, QuestionTemplateOutput } from '@devographics/types'
import { TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

const groups = [
    // {
    //     id: 'range_under_1',
    //     lowerBound: 0,
    //     average: 1,
    //     upperBound: 1
    // },
    {
        id: 'range_0_4',
        lowerBound: 0,
        upperBound: 5
    },
    {
        id: 'range_5_9',
        lowerBound: 5,
        upperBound: 10
    },
    {
        id: 'range_10_14',
        lowerBound: 10,
        upperBound: 15
    },
    {
        id: 'range_15_19',
        lowerBound: 15,
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
        id: 'range_over_30',
        lowerBound: 30
    }
    // {
    //     id: 'range_4_6',
    //     lowerBound: 4,
    //     upperBound: 7
    // },
    // {
    //     id: 'range_7_9',
    //     lowerBound: 7,
    //     upperBound: 10
    // },
    // {
    //     id: 'range_10_12',
    //     lowerBound: 10,
    //     upperBound: 13
    // },
    // {
    //     id: 'range_13_15',
    //     lowerBound: 13,
    //     upperBound: 16
    // },
    // {
    //     id: 'range_16_20',
    //     lowerBound: 16,
    //     upperBound: 21
    // },
    // {
    //     id: 'range_21_30',
    //     lowerBound: 21,
    //     upperBound: 30
    // },
    // {
    //     id: 'range_over_30',
    //     lowerBound: 30,
    //     average: 30
    // }
]

// const groups = [
//     {
//         id: 'range_under_1',
//         lowerBound: 0,
//         average: 1,
//         upperBound: 1
//     },
//     {
//         id: 'range_1_4',
//         lowerBound: 1,
//         upperBound: 5
//     },
//     {
//         id: 'range_5_9',
//         lowerBound: 5,
//         upperBound: 10
//     },
//     {
//         id: 'range_10_14',
//         lowerBound: 10,
//         upperBound: 15
//     },
//     {
//         id: 'range_over_15',
//         lowerBound: 15,
//         average: 15
//     }
// ]
export const years: TemplateFunction = options => {
    checkHasId(options)

    const question = {
        optionsAreNumeric: true,
        inputComponent: 'years',
        ...options.question
    } as QuestionTemplateOutput

    const output: QuestionTemplateOutput = {
        ...getPaths(options, DbSuffixes.CHOICES),
        groups,
        ...question
    }
    return output
}
