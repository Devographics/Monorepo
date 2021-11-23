export interface GitHub {
    id: string
    name: string
    full_name?: string
    description: string
    url: string
    stars: number
    forks?: number
    opened_issues?: number
    homepage: string
}

export interface Entity {
    id: string
    aliases?: string[]
    name: string
    otherName: string
    twitterName: string
    homepage?: string
    category?: string
    description?: string
    tags?: string[]
    match?: string[]
    github?: GitHub
    npm?: string
    type?: string
    mdn?: string
    patterns?: string[]
}

export interface Completion {
    count: number
    percentage: number
}

export interface EntityBucket {
    id: string
    count: number
    percentage_survey: number
    percentage_question: number
    percentage_facet: number
    entity: Entity
}
