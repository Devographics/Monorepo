import TwitterApi, { ApiResponseError, UserFollowingV2Paginator } from 'twitter-api-v2'
import { Db } from 'mongodb'

// Instanciate with desired auth type (here's Bearer v2 auth)
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '')

// Tell typescript it's a readonly app
const roClient = twitterClient.readOnly

// https://github.com/PLhery/node-twitter-api-v2/blob/master/doc/v2.md#users-by-usernames

// export const fetchTwitterResources = async (ids: string[]) => {
//   console.log('// fetchTwitterResource')
//   try {
//       const data = await roClient.v2.usersByUsernames(ids, { 'user.fields': 'profile_image_url' })

//       console.log(data)
//       // const user = data && data.data
//       // const avatarUrl = user?.profile_image_url?.replace('_normal', '')
//       return []
//   } catch (error) {
//       console.log(error)
//       return
//   }
// }

// https://github.com/PLhery/node-twitter-api-v2/blob/master/doc/v2.md#single-user-by-username

export const fetchTwitterUser = async (db: Db, twitterName: string) => {
    const user = await getTwitterUser(twitterName)
    if (!user) {
        return
    }
    const avatarUrl = user?.profile_image_url?.replace('_normal', '')
    const { id, description, public_metrics = {} } = user
    const { followers_count, following_count, tweet_count, listed_count } = public_metrics
    const publicMetrics = {
        followers: followers_count,
        following: following_count,
        tweet: tweet_count,
        listed: listed_count
    }
    return { twitterName, avatarUrl, id, description, publicMetrics }
}

export const getTwitterUser = async (twitterName: string) => {
    try {
        const data = await roClient.v2.userByUsername(twitterName, {
            'user.fields': ['public_metrics', 'profile_image_url', 'description']
        })
        const user = data && data.data
        return user
    } catch (error: any) {
        console.log('// getTwitterUser error')
        // console.log(error)
        console.log(error.rateLimit)
        const resetTime = new Date(error.rateLimit.reset * 1000)
        console.log(resetTime)
        console.log(error.data)
        return
    }
}

export const getTwitterFollowings = async (twitterId: string) => {
    let followings = []
    try {
        const result = await roClient.v2.following(twitterId, {
            asPaginator: true,
            max_results: 1000
        })
        // see https://github.com/PLhery/node-twitter-api-v2/blob/master/doc/paginators.md#fetch-until-rate-limit-hits
        for await (const following of result) {
            followings.push(following)
        }
        // followings = await result.fetchLast(9999)
        // console.log(followings)
    } catch (error: any) {
        console.log('// getTwitterFollowings error')
        if (error instanceof ApiResponseError && error.rateLimitError && error.rateLimit) {
            console.log(
                `You just hit the rate limit! Limit for this endpoint is ${error.rateLimit.limit} requests!`
            )
            console.log(`Request counter will reset at timestamp ${error.rateLimit.reset}.`)
        } else {
            console.log(error)
            console.log(error?.data?.errors)
        }
    }
    // console.log(`// @${twitterName}: fetched ${followings.length} followings`)
    const followingsUsernames = followings.map(f => f.username)
    return followingsUsernames
}
