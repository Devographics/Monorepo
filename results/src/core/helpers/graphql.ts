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
                currentEdition {
                  completion {
                    count
                    percentageSurvey
                    total
                  }
                  editionId
                  buckets {
                    count
                    id
                    percentageQuestion
                    percentageSurvey
                  }
                }
              }
            }
          }
        }
      }
    }
  }`
