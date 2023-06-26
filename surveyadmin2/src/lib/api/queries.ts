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

export const getEntitiesQuery = () => `
query EntitiesQuery {
  entities(includeNormalizationEntities: true) {
    ${entityFragment}
  }
}
`;

export const getSurveysQuery = () => `
query SurveysMetadataQuery {
  _metadata {
    surveys {
      id
      name
      dbCollectionName
      domain
      hashtag
      emailOctopus {
        listId
      }
      editions {
        id
        questionsUrl
        resultsUrl
        surveyId
        startedAt
        endedAt
        year
        status
        imageUrl
        faq
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
        colors {
          primary
          secondary
          text
          background
          backgroundSecondary
        }
      }
    }
  }
}`;

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
          questions {
            id
            intlId
            i18nNamespace
            yearAdded
            limit
            template
            extends
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

export const getAllLocalesMetadataQuery = () => `
query AllLocalesMetadataQuery {
  locales {
    id
    completion
    label
    repo
    totalCount
    translatedCount
    translators
  }
}`;

export const getLocaleQuery = ({
  localeId,
  contexts,
}: {
  localeId: string;
  contexts: string[];
}) => `
query Locale__${localeId.replace("-", "_")}__${contexts.join("_")}__Query {
  locale(localeId: "${localeId}", contexts: [${contexts.join(", ")}]) {
    id
    completion
    label
    repo
    totalCount
    translatedCount
    translators
    strings {
      tHtml
      t
      tClean
      key
      isFallback
      context
      aliasFor
    }
  }
}`;
