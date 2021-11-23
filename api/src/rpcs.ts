import { TwitterStat } from './types/twitter'
import { MongoClient } from 'mongodb'
import config from './config'
import { getEntities } from './entities'
import { getTwitterUser, getTwitterFollowings } from './external_apis/twitter'

function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

export const analyzeTwitterFollowings = async () => {
    console.log('// Running analyzeTwitterFollowings…')
    let count = 0

    // 0. Mongo setup
    const mongoClient = new MongoClient(process.env!.MONGO_URI!, { connectTimeoutMS: 1000 })
    await mongoClient.connect()
    const db = mongoClient.db(process.env.MONGO_DB_NAME)
    const resultsCollection = db.collection(config.mongo.normalized_collection)
    const twitterStatsCollection = db.collection('twitterStats')

    // 1. get all results documents with a twitter username associated
    const results = resultsCollection.find({ 'user_info.twitter_username': { $exists: true } })
    console.log(`// Found ${await results.count()} results with associated Twitter info`)

    // 2. loop over results
    for await (const result of results) {
        count++
        console.log(`${count}. @${result.user_info.twitter_username}`)

        const { surveySlug, user_info } = result
        const twitterName = user_info.twitter_username

        // 3. for each result, check if its twitter stats have already been calculated or not
        const existingStat = await twitterStatsCollection.findOne({ twitterName, surveySlug })

        if (existingStat) {
            console.log(`   -> Found existing stat, skipping`)
            console.log(existingStat)
        }

        // 4. if not, get twitter stats and insert them
        if (!existingStat) {
            const twitterUser = await getTwitterUser(twitterName)
            if (!twitterUser) {
                return
            }
            const twitterId = twitterUser?.id
            const followings = await getTwitterFollowings(twitterId)
            const entities = await getEntities({ tags: ['people', 'css'] })
            const peopleUsernames = entities.map(e => e.twitterName)
            const followingsSubset = followings.filter(f => peopleUsernames.includes(f))

            console.log(
                `   -> Stats: ${followings.length} followings; ${followingsSubset.length} people`
            )

            const stat: TwitterStat = {
                twitterId,
                twitterName,
                surveySlug,
                followings,
                followingsSubset,
                followersCount: twitterUser?.public_metrics?.followers_count,
                followingCount: twitterUser?.public_metrics?.following_count,
                tweetCount: twitterUser?.public_metrics?.tweet_count,
                listedCount: twitterUser?.public_metrics?.listed_count
            }

            twitterStatsCollection.insertOne(stat)
        }
    }
}
