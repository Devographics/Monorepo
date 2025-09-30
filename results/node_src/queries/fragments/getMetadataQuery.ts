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
        _metadata {
            surveys {
                id
                name
                homepageUrl
                isDisabled
                imageUrl
            }
        }
        surveys {
            ${surveyId} {
                _metadata {
                    domain
                    id
                    name
                    homepageUrl
                    imageUrl
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
                        imageUrl
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
                                template
                                optionsAreNumeric
                                optionsAreRange
                                optionsAreSequential
                                allowMultiple
                                allowComment
                                allowOther
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
                                    lowerBound
                                    upperBound
                                }
                                groups {
                                    id
                                    average
                                    lowerBound
                                    upperBound
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
