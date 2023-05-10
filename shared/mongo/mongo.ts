/**
 * Methods that retrieve a collection also handle the proper connection logic
 * 
 * TODO: get rid of direct access to env variables, maybe by moving back
 * some methods into each app and pass the uri as params from config (eg in surveyform)
 */
import { Survey } from '@devographics/types'
import { MongoClient, Db } from 'mongodb'

const dbs: { [name: string]: Promise<Db> } = {}

const connectToDb = async ({ dbUri, dbName }) => {
    const mongoClient = new MongoClient(dbUri, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        connectTimeoutMS: 10000,
        compressors: 'none'
    })
    await mongoClient.connect()
    return mongoClient.db(dbName)
}
export const getMongoDb = async ({ dbUri, dbName }): Promise<Db> => {
    if (!(dbName in dbs)) {
        // important: do not await so we store the promise
        dbs[dbName] = connectToDb({ dbUri, dbName })
    }
    return await dbs[dbName]
}

const getAppDb = () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI not set")
    }
    return getMongoDb({ dbUri: process.env.MONGO_URI, dbName: "production" })
}
const getReadOnlyDb = () => {
    if (!process.env.MONGO_URI_PUBLIC_READ_ONLY) {
        throw new Error("MONGO_URI_PUBLIC_READ_ONLY not set")
    }
    return getMongoDb({ dbUri: process.env.MONGO_URI_PUBLIC_READ_ONLY, dbName: "public" })
}

export const getRawResponsesCollection = async (survey?: Survey) => {
    const db = await getAppDb()
    return db.collection('responses')
}

export const getNormResponsesCollection = async (survey?: Survey) => {
    const db = await getReadOnlyDb()
    return db.collection(survey?.dbCollectionName || 'normalized_responses')
}

export const getUsersCollection = async () => {
    const db = await getAppDb()
    return db.collection('users')
}

export const getProjectsCollection = async () => {
    const db = await getAppDb()
    return db.collection('projects')
}

export const getEmailHashesCollection = async () => {
    const db = await getAppDb()
    return db.collection('email_hashes')
}

export const isLocalMongoUri = () => {
    const mongoUri = process.env.MONGO_URI
    if (!mongoUri)
        throw new Error('MONGO_URI env variable not defined. Is your .env file correctly loaded?')
    const isLocal = mongoUri.match(/localhost/)
    return isLocal
}
