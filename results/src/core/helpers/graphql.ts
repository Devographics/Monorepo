import { Survey, Edition, Section, Question } from '@devographics/types'

type GetDefaultQueryArgs = {
    survey: Survey
    edition: Edition
    section: Section
    question: Question
}

export const getDefaultQuery = ({ survey, edition, section, question }: GetDefaultQueryArgs) => `
query MyQuery {
    surveys {
      ${survey.id} {
        ${edition.id} {
          ${section.id} {
            ${question.id} {
              id
              responses {
                current_edition {
                  completion {
                    count
                    percentage_survey
                    total
                  }
                  editionId
                  buckets {
                    count
                    id
                    percentage_question
                    percentage_survey
                  }
                }
              }
            }
          }
        }
      }
    }
  }`
