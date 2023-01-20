import { SurveyDocument } from "@devographics/core-models"

// Subset of a survey, just enough to show a survey item among other without loading questions
export type SurveyDescription = Pick<SurveyDocument, "name" | "status" | "prettySlug" | "slug" | "year" | "imageUrl">

// TODO: get this list from the survey repo directly
// we could have a file containing an index of surveys at the root
// and fetch other relevant data via github API and the yaml files
export const fetchSurveysList = async (): Promise<Array<SurveyDescription>> => ([
    {
        status: 2,
        name: "Demo survey",
        year: 2022,
        slug: "demo_survey",
        prettySlug: "demo-survey",
        imageUrl: "https://devographics.github.io/surveys/state_of_graphql/2022/images/graphql2022.png"
    }
    // TODO: add older closed surveys for reference
])