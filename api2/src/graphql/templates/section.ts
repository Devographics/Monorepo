import { graphqlize } from '../../generate/helpers'
import { Survey, Edition, Section, ParsedQuestion } from '../../types/surveys'

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
    questions: ParsedQuestion[]
    path: string
}) => {
    const typeName = `${graphqlize(edition.id)}${graphqlize(section.id)}Section`
    return {
        path,
        typeName,
        typeDef: `type ${typeName} {
    ${questions
        .map((question: ParsedQuestion) => {
            return `${question.id}: ${question.fieldTypeName}`
        })
        .join('\n    ')}
}`
    }
}
