import { ApolloServer } from 'apollo-server-express'
import { MongoClient } from 'mongodb'
// @see https://github.com/apollographql/apollo-server/issues/6022
import responseCachePluginPkg from 'apollo-server-plugin-response-cache'
const responseCachePlugin = (responseCachePluginPkg as any).default

import defaultTypeDefs from './graphql/typedefs/schema.graphql'
import { RequestContext } from './types'
import express, { Request, Response } from 'express'
// import { clearCache } from './caching'
import { createClient } from 'redis'
import { reinitialize } from './init'
import path from 'path'
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'

import Sentry from '@sentry/node'

import { rootDir } from './rootDir'
import { appSettings } from './helpers/settings'

// import { cacheAvatars } from './avatars'

import { logToFile } from '@devographics/helpers'
import { loadOrGetSurveys } from './load/surveys'

//import Tracing from '@sentry/tracing'

import { generateTypeObjects, getQuestionObjects, parseSurveys } from './generate/generate'
import { generateResolvers } from './generate/resolvers'

import { loadOrGetEntities } from './load/entities'

const app = express()

const environment = process.env.ENVIRONMENT || process.env.NODE_ENV

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true })
        // enable Express.js middleware tracing
        // new Tracing.Integrations.Express({ app }),
    ],
    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
    environment
})

// const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

const checkSecretKey = async (req: Request, res: Response, func: () => Promise<void>) => {
    if (req?.query?.key !== process.env.SECRET_KEY) {
        // throw new Error('Authorization error')
        res.status(401).send('Not authorized')
    } else {
        await func()
    }
}

function getMongoUri() {
    const uri = process.env.MONGO_URI
    if (!uri) throw new Error('MONGO_URI not defined')
    return uri
}

const start = async () => {
    const startedAt = new Date()
    console.log('// Starting server…')
    const redisClient = createClient({
        url: appSettings.redisUrl
    })

    redisClient.on('error', err => console.log('Redis Client Error', err))

    const mongoClient = new MongoClient(getMongoUri(), {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        connectTimeoutMS: 10000
    })

    if (appSettings.cacheType !== 'local') {
        await redisClient.connect()
    }

    await mongoClient.connect()

    const db = mongoClient.db(process.env.MONGO_DB_NAME)

    const entities = await loadOrGetEntities({})
    const context = { db, redisClient }

    const isDevOrTest = !!(
        process.env.NODE_ENV && ['test', 'development'].includes(process.env.NODE_ENV)
    )
    const surveys = await loadOrGetSurveys({ includeDemo: isDevOrTest })
    const questionObjects = getQuestionObjects({ surveys })

    const parsedSurveys = parseSurveys({ surveys })

    const typeObjects = await generateTypeObjects({ surveys: parsedSurveys, questionObjects })
    const allTypeDefsString = typeObjects.map(t => t.typeDef).join('\n\n')

    await logToFile('questionObjects.yml', questionObjects, { mode: 'overwrite' })
    await logToFile('typeDefs.yml', typeObjects, { mode: 'overwrite' })
    await logToFile('typeDefs.graphql', allTypeDefsString, { mode: 'overwrite' })

    const defaultResolvers = {
        JSON: GraphQLJSON,
        JSONObject: GraphQLJSONObject
    }
    const generatedResolvers = await generateResolvers({
        surveys: parsedSurveys,
        questionObjects,
        typeObjects
    })
    const resolvers = { ...defaultResolvers, ...generatedResolvers }

    const server = new ApolloServer({
        typeDefs: [defaultTypeDefs, allTypeDefsString],
        resolvers,
        debug: isDev,
        // tracing: isDev,
        // cacheControl: true,
        introspection: true,
        // playground: false,
        plugins: [responseCachePlugin()],
        // engine: {
        //     debugPrintReports: true
        // },
        formatError: err => {
            console.log(err)
            return err
        },
        context: (expressContext): RequestContext => {
            // TODO: do this better with a custom header
            const isDebug = expressContext?.req?.rawHeaders?.includes('http://localhost:4031')
            return {
                ...context,
                isDebug
            }
        }
    })

    app.use(Sentry.Handlers.requestHandler())
    // TracingHandler creates a trace for every incoming request
    // app.use(Sentry.Handlers.tracingHandler());

    await server.start()

    server.applyMiddleware({ app })

    app.get('/', function (req, res) {
        res.sendFile(path.join(rootDir + '/public/welcome.html'))
    })

    // app.get('/debug-sentry', function mainHandler(req, res) {
    //     throw new Error('My first Sentry error!')
    // })

    // app.get('/analyze-twitter', async function (req, res) {
    //     checkSecretKey(req)
    //     analyzeTwitterFollowings()
    //     res.status(200).send('Analyzing…')
    // })

    app.get('/reinitialize', async function (req, res) {
        await checkSecretKey(req, res, async () => {
            await reinitialize({ context })
            res.status(200).send('Cache cleared')
        })
    })

    app.get('/reinitialize-surveys', async function (req, res) {
        await checkSecretKey(req, res, async () => {
            await reinitialize({ context, initList: ['surveys'] })
            res.status(200).send('Cache cleared')
        })
    })

    app.get('/reinitialize-entities', async function (req, res) {
        await checkSecretKey(req, res, async () => {
            await reinitialize({ context, initList: ['entities'] })
            res.status(200).send('Cache cleared')
        })
    })

    // app.get('/cache-avatars', async function (req, res) {
    //     checkSecretKey(req)
    //     await cacheAvatars({ context })
    //     res.status(200).send('Cache cleared')
    // })

    app.use(Sentry.Handlers.errorHandler())

    const port = process.env.PORT || 4030

    // const data = await initMemoryCache({ context, initList: ['entities', 'surveys'] })

    // if (process.env.INITIALIZE_CACHE_ON_STARTUP) {
    //     await initDbCache({ context, data })
    // }

    // if (process.env.LOAD_DATA === 'local') {
    //     await watchFiles({
    //         context,
    //         config: {
    //             entities: process.env.ENTITIES_DIR,
    //             surveys: process.env.SURVEYS_DIR
    //         }
    //     })
    // }

    const finishedAt = new Date()

    app.listen({ port: port }, () =>
        console.log(
            `🚀 Server ready at http://localhost:${port}${server.graphqlPath} (in ${
                finishedAt.getTime() - startedAt.getTime()
            }ms)`
        )
    )
}

start()
