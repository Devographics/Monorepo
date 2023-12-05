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
import {
    ResponseDocument,
    NormalizedResponseDocument,
    Survey,
    CustomNormalizationDocument
} from '@devographics/types'
import { MongoClient, Db, Document } from 'mongodb'
import { nanoid } from 'nanoid'
import { getEnvVar, EnvVar } from '@devographics/helpers'

const clients: { [uri: string]: Promise<MongoClient> } = {}

const connectToDb = async ({ dbUri }: { dbUri: string }) => {
    const mongoClient = new MongoClient(dbUri, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        connectTimeoutMS: 10000,
        compressors: 'none'
    })
    await mongoClient.connect()
    return mongoClient
}

const getClient = async ({ dbUri }: { dbUri: string }): Promise<MongoClient> => {
    if (!(dbUri in clients)) {
        // important: do not await so we store the promise
        clients[dbUri] = connectToDb({ dbUri })
    }
    return await clients[dbUri]
}
export const getMongoDb = async ({
    dbUri,
    dbName
}: {
    dbUri: string
    dbName: string
}): Promise<Db> => {
    if (!dbUri) {
        throw new Error('getMongoDb error: dbUri is not defined')
    }
    if (!dbName) {
        throw new Error('getMongoDb error: dbName is not defined')
    }
    return (await getClient({ dbUri })).db(dbName)
}

export const getPrivateDb = async () =>
    await getMongoDb({
        dbUri: getEnvVar(EnvVar.MONGO_PRIVATE_URI),
        dbName: getEnvVar(EnvVar.MONGO_PRIVATE_DB)
    })

export const getPublicDb = async () =>
    await getMongoDb({
        dbUri: getEnvVar(EnvVar.MONGO_PUBLIC_URI),
        dbName: getEnvVar(EnvVar.MONGO_PUBLIC_DB)
    })

export const getPublicDbReadOnly = async () =>
    await getMongoDb({
        dbUri: getEnvVar(EnvVar.MONGO_PUBLIC_URI_READONLY),
        dbName: getEnvVar(EnvVar.MONGO_PUBLIC_DB)
    })

/*
 * Generate a new STRING id for Mongo
 * To be used when calling "insertOne"
 * This avoids having ObjectId leaking everywhere in relations
 * /!\ We don't guarantee that it's a valid ObjectId, we currently use nanoid instead
 */
export const newMongoId = (): string => nanoid()

/**
 * Used to get the full MongoClient, eg to disconnect
 * Handles the connection automatically
 * @returns
 */
export const getAppClient = () => {
    if (!process.env.MONGO_PRIVATE_URI) {
        throw new Error('MONGO_PRIVATE_URI not set')
    }
    return getClient({ dbUri: process.env.MONGO_PRIVATE_URI })
}
/**
 * Handle the connection automatically when called the first time
 */
export const getAppDb = () => {
    if (!process.env.MONGO_PRIVATE_URI) {
        throw new Error('MONGO_PRIVATE_URI not set')
    }
    const dbName = process.env.MONGO_PRIVATE_DB || 'production'
    return getMongoDb({ dbUri: process.env.MONGO_PRIVATE_URI, dbName })
}

export const getCollectionByName = async <T extends Document>(name: string) => {
    const db = await getAppDb()
    return db.collection<T>(name)
}

export const getRawResponsesCollection = async (survey?: Survey) => {
    const db = await getAppDb()
    return db.collection<ResponseDocument>(survey?.responsesCollectionName || 'responses')
}

export const getNormResponsesCollection = async (survey?: Survey) => {
    const db = await getPublicDb()
    return db.collection<NormalizedResponseDocument>(
        survey?.normalizedCollectionName || 'normalized_responses'
    )
}

export const getUsersCollection = async <T extends Document>() => {
    const db = await getAppDb()
    return db.collection<T>('users')
}

export const getSavesCollection = async <T extends Document>() => {
    const db = await getAppDb()
    return db.collection<T>('saves')
}

export const getCustomNormalizationsCollection = async () => {
    const db = await getAppDb()
    return db.collection<CustomNormalizationDocument>('custom_normalizations')
}

/**
 * Handle the connection automatically when called the first time
 */
export const getProjectsCollection = async <T extends Document>() => {
    const db = await getAppDb()
    return db.collection<T>('projects')
}

/**
 * Handle the connection automatically when called the first time
 */
export const getEmailHashesCollection = async <T extends Document>() => {
    const db = await getAppDb()
    return db.collection<T>('email_hashes')
}

export const isLocalMongoUri = () => {
    const mongoUri = process.env.MONGO_PRIVATE_URI
    if (!mongoUri)
        throw new Error(
            'MONGO_PRIVATE_URI env variable not defined. Is your .env file correctly loaded?'
        )
    const isLocal = mongoUri.match(/localhost/)
    return isLocal
}
