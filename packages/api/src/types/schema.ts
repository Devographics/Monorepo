/**
 * Used to represent survey question completion.
 */
export interface YearCompletion {
    // total number of participants
    total: number
    // current number of respondents
    count: number    
    // percentage of respondents compared to the total number of participants
    percentage_survey: number
}

export interface FacetCompletion {
    // total number of participants
    total: number
    // current number of respondents
    count: number
    // percentage of respondents compared to the total number of participants
    percentage_question: number
    // percentage of respondents compared to the total number of participants
    percentage_survey: number
}