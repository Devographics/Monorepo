export const getDefaultQuery = ({ survey, edition, section, question }) => `
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
