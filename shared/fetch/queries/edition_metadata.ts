/*

Unless specified, these queries are designed to be used by surveyform

*/

import { getEntityFragment } from './entity_fragment'

export const getEditionMetadataQuery = ({ editionId }: { editionId: string }) => `
  query ${editionId}MetadataQuery {
    _metadata(editionId: ${editionId}) {
      surveys {
        editions {
          id
          surveyId
          year
          status
          resultsStatus
          hashtag
          startedAt
          endedAt
          questionsUrl
          feedbackUrl
          resultsUrl
          imageUrl
          faviconUrl
          socialImageUrl
          faq
          enableReadingList
          enableChartSponsorships
          enableSkip
          colors {
            primary
            secondary
            text
            background
            backgroundSecondary
          }
          survey {
            domain
            id
            name
            responsesCollectionName
            normalizedCollectionName
            hashtag
            emailOctopus {
              listId
            }
            partners {
              id
              name
              url
              imageUrl
            }
          }
          sponsors {
            id
            imageUrl
            name
            url
          }
          credits {
            id
            role
            entity {
              id
              name
              twitterName
              company {
                name
                homepage {
                  url
                }
              }
            }
          }
          sections(include: outlineOnly) {
            id
            messageId
            slug
            intlId
            questions {
              id
              intlId
              sectionId
              i18nNamespace
              yearAdded
              limit
              template
              inputComponent
              hidden
              # contentType
              allowOther
              longText
              isRequired
              allowComment
              showCommentInput
              allowMultiple
              countsTowardScore
              cutoff
              randomize
              order
              optionsAreNumeric
              # optionsAreRange
              entity {
                ${getEntityFragment()}
              }
              rawPaths {
                base
                comment
                followup_predefined
                followup_freeform
                other
                prenormalized
                response
                other
                comment
                other
                prenormalized
                response
                subPaths
                skip
              }
              options {
                id
                intlId
                label
                entity {
                  ${getEntityFragment()}
                }
              }
              followups {
                id
                options {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
  `
