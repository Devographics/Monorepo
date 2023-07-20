const entityFragment = `
id
nameClean
nameHtml
example {
  language
  code
  codeHighlighted
}
descriptionClean
descriptionHtml
homepage {
  url
}
github {
  url
}
mdn {
  url
  summary
}
w3c {
  url
}
caniuse {
  name
  url
}
resources {
  title
  url
}
tags
patterns
`;

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
          template
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
            matchTags
            entity {
              ${entityFragment}
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
`;
