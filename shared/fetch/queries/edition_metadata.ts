import { entityFragment } from './entity_fragment'

export const getEditionMetadataQuery = ({ editionId }: { editionId: string }) => `
  query ${editionId}MetadataQuery {
    _metadata(editionId: ${editionId}) {
      surveys {
        editions {
          id
          surveyId
          year
          status
          hashtag
          startedAt
          endedAt
          questionsUrl
          resultsUrl
          imageUrl
          faviconUrl
          socialImageUrl
          faq
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
            dbCollectionName
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
              i18nNamespace
              yearAdded
              limit
              template
              inputComponent
              # contentType
              allowOther
              allowComment
              showCommentInput
              allowMultiple
              randomize
              optionsAreNumeric
              # optionsAreRange
              entity {
                ${entityFragment}
              }
              rawPaths {
                response
                other
                comment
              }
              options {
                id
                intlId
                label
                entity {
                  ${entityFragment}
                }
              }
            }
          }
        }
      }
    }
  }
  `
