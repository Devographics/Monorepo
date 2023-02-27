import { YearCompletion } from './index'
import { MDN } from './mdn'

export interface FeatureBucket {
    id: string
    name: string
    count: number
    percentage: number
}

export interface EditionFeature {
    year: number
    editionId: string
    total: number
    completion: YearCompletion
    buckets: FeatureBucket[]
}

export interface FeatureExperienceBucket {
    id: string
    count: number
    percentage: number
}

export interface FeatureExperience {
    all_editions: EditionFeature[]
    edition: EditionFeature
}

export interface Feature {
    id: string
    name: string
    mdn: MDN
    experience: FeatureExperience
}
