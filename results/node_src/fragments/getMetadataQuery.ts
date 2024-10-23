import { getEntityFragment } from './getEntityFragment'

export const getMetadataQuery = ({
    surveyId,
    editionId
}: {
    surveyId: string
    editionId: string
}) => {
    return `
query {
    dataAPI {
        surveys {
            ${surveyId} {
                _metadata {
                    domain
                    id
                    name
                    hashtag
                    emailOctopus {
                        listId
                        submitUrl
                    }
                    partners {
                        name
                        url
                        imageUrl
                    }
                    editions {
                        year
                        id
                        resultsUrl
                    }
                }
                ${editionId} {
                    _metadata {
                        id
                        year
                        status
                        startedAt
                        endedAt
                        questionsUrl
                        issuesUrl
                        discordUrl
                        resultsUrl
                        imageUrl
                        faviconUrl
                        socialImageUrl
                        hashtag
                        enableChartSponsorships
                        tshirt {
                            images
                            url
                            price
                            designerUrl
                        }
                        sponsors {
                            id
                            name
                            url
                            imageUrl
                        }
                        credits {
                            id
                            role
                            ${getEntityFragment()}
                        }
                        sections {
                            id
                            questions {
                                id
                                i18nNamespace
                                template
                                optionsAreNumeric
                                optionsAreRange
                                optionsAreSequential
                                entity {
                                    id
                                    name
                                    nameClean
                                    nameHtml
                                    alias
                                }
                                options {
                                    ${getEntityFragment()}
                                    id
                                    average
                                }
                                groups {
                                    id
                                    average
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}`
}
