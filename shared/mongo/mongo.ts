import { Survey } from '@devographics/types'
import { MongoClient, Db } from 'mongodb'

const dbs = {}

export const getMongoDb = async ({ dbUri, dbName }): Promise<Db> => {
    if (dbs[dbName]) {
        return dbs[dbName]
    } else {
        const mongoClient = new MongoClient(dbUri, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            connectTimeoutMS: 10000
        })

        await mongoClient.connect()

        const db = mongoClient.db(dbName)
        dbs[dbName] = db
        return db
    }
}

export const getRawResponsesCollection = async (survey?: Survey) => {
    const db = await getMongoDb({
        dbUri: process.env.MONGO_URI,
        dbName: 'production'
    })
    return db.collection('responses')
}

export const getNormResponsesCollection = async (survey?: Survey) => {
    const db = await getMongoDb({
        dbUri: process.env.MONGO_URI_PUBLIC_READONLY,
        dbName: 'public'
    })
    return db.collection(survey?.dbCollectionName || 'normalized_responses')
}

export const getUsersCollection = async () => {
    const db = await getMongoDb({
        dbUri: process.env.MONGO_URI,
        dbName: 'production'
    })
    return db.collection('users')
}

export const isLocalMongoUri = () => {
    const mongoUri = process.env.MONGO_URI
    if (!mongoUri)
        throw new Error('MONGO_URI env variable not defined. Is your .env file correctly loaded?')
    const isLocal = mongoUri.match(/localhost/)
    return isLocal
}
