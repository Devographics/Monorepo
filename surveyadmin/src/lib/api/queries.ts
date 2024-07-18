export const getEditionMetadataQuery = ({
  editionId,
}: {
  editionId: string;
}) => `
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
          hashtag
        }
        sections(include: outlineOnly) {
          id
          messageId
          slug
          intlId
          template
          questions {
            id
            sectionId
            intlId
            i18nNamespace
            yearAdded
            limit
            template
            inputComponent
            # contentType
            allowOther
            longText
            allowComment
            showCommentInput
            allowMultiple
            randomize
            optionsAreNumeric
            # optionsAreRange
            matchType
            matchTags
            disallowedTokenIds
            followups {
              id
              options {
                id
              }
            }
            options {
              id
              intlId
              label
            }
            rawPaths {
              base
              response
              other
              comment
              prenormalized
              followup_predefined
              followup_freeform
              subPaths
              skip
            }
            normPaths {
              base
              response
              other
              prenormalized
              comment
              followup_predefined
              followup_freeform
              raw
              patterns
              metadata
              error
            }
          }
        }
      }
    }
  }
}
`;
