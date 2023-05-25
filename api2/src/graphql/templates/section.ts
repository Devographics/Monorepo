import { graphqlize } from '../../generate/helpers'
import { Survey, Edition, Section, QuestionApiObject } from '../../types/surveys'

/*

Sample output:

type Js2021UserInfoSection {
    age: StateOfJsAge
    years_of_experience: StateOfJsYearsOfExperience
    company_size: StateOfJsCompanySize
    yearly_salary: StateOfJsYearlySalary
    higher_education_degree: StateOfJsHigherEducationDegree
    # etc.
}

*/

export const generateSectionType = ({
    survey,
    edition,
    section,
    questions,
    path
}: {
    survey: Survey
    edition: Edition
    section: Section
    questions: QuestionApiObject[]
    path: string
}) => {
    const typeName = `${graphqlize(edition.id)}${graphqlize(section.id)}Section`
    return {
        path,
        typeName,
        typeType: 'section',
        typeDef: `type ${typeName} {
    ${questions
        .filter(q => q.hasApiEndpoint !== false)
        .map((question: QuestionApiObject) => {
            return `${question.id}: ${question.fieldTypeName}`
        })
        .join('\n    ')}
}`
    }
}
