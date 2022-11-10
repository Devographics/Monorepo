/**
 * The various types of surveys supported by the API
 */
export type SurveyType = 'state_of_js' | 'state_of_css' | 'state_of_graphql'

export type SurveyYear = 2016 | 2017 | 2018 | 2019 | 2020 | 2021

export type SurveySlug =
    | 'css2019'
    | 'css2020'
    | 'css2021'
    | 'js2016'
    | 'js2017'
    | 'js2018'
    | 'js2019'
    | 'js2020'
    | 'js2021'

// todo: generate this from GraphQL?
export type Survey = {
    editions: SurveyEdition[]
}

export type SurveyEdition = {
    config: SurveyConfig;
    questions: SurveySections[]
}

export type SurveyConfig = {
    surveyId: string
    credits: SurveyCredit[]
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