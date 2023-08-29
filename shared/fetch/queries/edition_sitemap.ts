import { entityFragment } from './entity_fragment'

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
                entity {
                    ${entityFragment}
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
                  entity {
                      ${entityFragment}
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
              entity {
                  ${entityFragment}
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
                entity {
                    ${entityFragment}
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
