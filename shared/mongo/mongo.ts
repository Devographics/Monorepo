/**
 * Methods that retrieve a collection
 * All exported methods automatically handle the connection
 * 
 * This module rely on env variable, this is the best solution we have found
 * to avoid an explicit initialization step
 * 
 * Each app can pass their own typings 
 * (because they might want to know only a subset of each collection type)
 */
import { Survey } from '@devographics/types'
import { MongoClient, Db } from 'mongodb'
import { nanoid } from 'nanoid'

const clients: { [uri: string]: Promise<MongoClient> } = {}

const connectToDb = async ({ dbUri }) => {
    const mongoClient = new MongoClient(dbUri, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        connectTimeoutMS: 10000,
        compressors: 'none'
    })
    await mongoClient.connect()
    return mongoClient
}

const getClient = async ({ dbUri }): Promise<MongoClient> => {
    if (!(dbUri in clients)) {
        // important: do not await so we store the promise
        clients[dbUri] = connectToDb({ dbUri })
    }
    return await clients[dbUri]
}
export const getMongoDb = async ({ dbUri, dbName }): Promise<Db> => {
    return (await getClient({ dbUri })).db(dbName)
}

/**
 * Generate a new STRING id for Mongo
 * To be used when calling "insertOne"
 * This avoids having ObjectId leaking everywhere in relations
 * /!\ We don't guarantee that it's a valid ObjectId, we currently use nanoid instead
 * @returns 
 */
export const newMongoId = (): string => nanoid()//(new ObjectId()).toString()

/**
 * Used to get the full MongoClient, eg to disconnect
 * Handles the connection automatically
 * @returns 
 */
export const getAppClient = () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI not set")
    }
    return getClient({ dbUri: process.env.MONGO_URI })
}
/**
 * Handle the connection automatically when called the first time
 */
export const getAppDb = () => {
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

/**
 * Handle the connection automatically when called the first time
 */
export const getRawResponsesCollection = async (survey?: Survey) => {
    const db = await getAppDb()
    return db.collection('responses')
}

/**
 * Handle the connection automatically when called the first time
 */
export const getNormResponsesCollection = async (survey?: Survey) => {
    const db = await getReadOnlyDb()
    return db.collection(survey?.dbCollectionName || 'normalized_responses')
}

/**
 * Handle the connection automatically when called the first time
 */
export const getUsersCollection = async <T extends Document>() => {
    const db = await getAppDb()
    return db.collection<T>('users')
}

export const getSavesCollection = async <T extends Document>() => {
    const db = await getAppDb()
    return db.collection<T>('saves')
}

/**
 * Handle the connection automatically when called the first time
 */
export const getProjectsCollection = async () => {
    const db = await getAppDb()
    return db.collection('projects')
}

/**
 * Handle the connection automatically when called the first time
 */
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
