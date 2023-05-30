export const getSurveysQuery = () => `
query SurveysMetadataQuery {
  _metadata {
    surveys {
      id
      name
      dbCollectionName
      domain
      hashtag
      editions {
        id
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
            allowMultiple
            optionsAreNumeric
            # optionsAreRange
            entity {
              nameClean
              nameHtml
              example {
                language
                code
                codeHighlighted
              }
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
                nameClean
                nameHtml
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
