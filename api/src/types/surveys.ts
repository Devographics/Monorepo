/**
 * The various types of surveys supported by the API
 */
export type SurveyType = 'state_of_js' | 'state_of_css' | 'state_of_graphql'

export type SurveyYear = 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022

export type SurveySlug =
    | 'css2019'
    | 'css2020'
    | 'css2021'
    | 'css2022'
    | 'js2016'
    | 'js2017'
    | 'js2018'
    | 'js2019'
    | 'js2020'
    | 'js2021'
    | 'js2022'

// TODO: unify with shared "SurveyEditions"
export type Survey = {
    name: string
    editions: SurveyEdition[]
}

export type SurveyEdition = {
    surveyId: string
    credits: SurveyCredit[]
    questions: SurveySections[]
}

export type SurveyCredit = {
    id: string
}

export type SurveySections = {
    questions: SurveyQuestion[]
}

export type SurveyQuestion = {
    id: string
    options?: QuestionOption[]
}

export type QuestionOption = {
    id: string
}