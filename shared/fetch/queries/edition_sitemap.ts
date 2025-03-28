import { getEntityFragment } from './entity_fragment'

export const getEditionSitemapQuery = ({ editionId }: { editionId: string }) => `
  query ${editionId}SitemapQuery {
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
          issuesUrl
          discordUrl
          feedbackUrl
          resultsUrl
          imageUrl
          faviconUrl
          socialImageUrl
          faq
          enableReadingList
          enableChartSponsorships
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
              submitUrl
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
              homepageUrl
              company {
                name
                homepage {
                  url
                }
              }
            }
          }
          
          sitemap {
            id
            path
            titleId
            descriptionId
            children {
              descriptionId
              id
              path
              titleId
              blocks {
                id
                path
                entity {
                    ${getEntityFragment()}
                }
                fieldId
                tabId
                titleId
                descriptionId
                i18nNamespace
                template
                blockType
                filtersState
                year
                items
                defaultUnits
                parameters {
                  years
                  rankCutoff
                  limit
                  cutoff
                  showNoAnswer
                }
                queryOptions {
                  addBucketsEntities
                }
                variants {
                  id
                  path
                  entity {
                      ${getEntityFragment()}
                  }
                  fieldId
                  tabId
                  titleId
                  descriptionId
                  i18nNamespace
                  template
                  blockType
                  filtersState
                  year
                  items
                  defaultUnits
                  parameters {
                    years
                    rankCutoff
                    limit
                    cutoff
                    showNoAnswer
                  }
                  queryOptions {
                    addBucketsEntities
                  }
                }
              }
            }
            blocks {
              id
              path
              entity {
                  ${getEntityFragment()}
              }
              fieldId
              tabId
              titleId
              descriptionId
              i18nNamespace
              template
              blockType
              filtersState
              year
              items
              defaultUnits
              parameters {
                years
                rankCutoff
                limit
                cutoff
                showNoAnswer
              }
              queryOptions {
                addBucketsEntities
              }
              variants {
                id
                path
                entity {
                    ${getEntityFragment()}
                }
                fieldId
                tabId
                titleId
                descriptionId
                i18nNamespace
                template
                blockType
                filtersState
                year
                items
                defaultUnits
                parameters {
                  years
                  rankCutoff
                  limit
                  cutoff
                  showNoAnswer
                }
                queryOptions {
                  addBucketsEntities
                }
              }
            }
          }
        }
      }
    }
  }
  `
