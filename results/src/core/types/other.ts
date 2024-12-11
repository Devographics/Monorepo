export type RecommendedResource = {
    name: string
    id: string
    description: string
    url: string
    image: string
    teacher?: string
    company?: string
    jobs?: RecommendedResourceJob[]
}

export type RecommendedResourceJob = { company: string; position: string; url: string }
