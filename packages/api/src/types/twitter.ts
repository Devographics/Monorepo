import { SurveySlug } from './surveys'

export interface TwitterStat {
    twitterId: string
    twitterName: string
    surveySlug: SurveySlug
    followings: string[]
    followingsSubset: string[]
    followersCount?: number
    followingCount?: number
    tweetCount?: number
    listedCount?: number
}
