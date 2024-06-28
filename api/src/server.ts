import { ApolloServer } from 'apollo-server-express'
import { MongoClient } from 'mongodb'
// @see https://github.com/apollographql/apollo-server/issues/6022
import responseCachePluginPkg from 'apollo-server-plugin-response-cache'
const responseCachePlugin = (responseCachePluginPkg as any).default
import dotenv from 'dotenv'

import defaultTypeDefs from './graphql/typedefs/schema.graphql'
import { RequestContext } from './types'
import express, { Request, Response, json } from 'express'
import { reinitialize } from './init'
import path from 'path'
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'

import Sentry from '@sentry/node'

import { rootDir } from './rootDir'

// import { cacheAvatars } from './avatars'

import { AppName } from '@devographics/types'
import { EnvVar, getConfig, getEnvVar, setAppName } from '@devographics/helpers'
import { logToFile } from '@devographics/debug'
import { getSurveysLoadMethod, loadOrGetSurveys } from './load/surveys'

//import Tracing from '@sentry/tracing'

import { generateTypeObjects, getQuestionObjects, parseSurveys } from './generate/generate'
import { generateResolvers } from './generate/resolvers'

import { watchFiles } from './helpers/watch'

import { initRedis } from '@devographics/redis'
import { getPublicDb } from '@devographics/mongo'
import { ghWebhooks } from './webhooks'
import { getRepoSHA } from './external_apis'
import { initProjects } from './load/projects'
import { getEntitiesLoadMethod } from './load/entities'
import { getLocaleIds, getLocalesLoadMethod } from './load/locales/locales'

const envPath = process.env.ENV_FILE ? process.env.ENV_FILE : '.env'
dotenv.config({ path: envPath })

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

/**
 * Check a secret API key that allows triggering API reload
 * for instance to reload locales on change
 * @param req
 * @param res
 * @param func
 */
const checkSecretKey = async (req: Request, res: Response, func: () => Promise<void>) => {
    if (req?.query?.key !== process.env.SECRET_KEY) {
        // throw new Error('Authorization error')
        res.status(401).send('Not authorized')
    } else {
        await func()
    }
}

// if SURVEYS_URL is defined, then use that to load surveys;
// if not, look in local filesystem
// TODO
// export const getLoadMethod = () => (process.env.SURVEYS_URL ? 'remote' : 'local')
export const getLoadMethod = () => 'todo'

const start = async () => {
    const config: dotenv.DotenvConfigOptions = {}
    if (process.env.ENV_PATH) {
        config.path = process.env.ENV_PATH
    }
    dotenv.config(config)
    const appName = AppName.API
    setAppName(appName)
    const startedAt = new Date()

    // const cachingMethods = getCachingMethods()
    // const cachingMethodsString = Object.keys(cachingMethods)
    //     .map(cm => (cachingMethods[cm] ? cm : strikeThrough(cm)))
    //     .join(', ')

    const localeIds = getLocaleIds()

    console.log(
        `---------------------------------------------------------------
• 📄 env file = ${envPath}
• 📄 config = ${process.env.CONFIG}
• 📖 surveys = ${getSurveysLoadMethod()}
• ⏱️ fast build = ${process.env.FAST_BUILD === 'true'}
• 🌐 locales = ${
            localeIds.length === 0 ? 'all available' : localeIds.join(', ')
        } (load method: ${getLocalesLoadMethod()})
• 🙎 entities = ${getEntitiesLoadMethod()}
---------------------------------------------------------------`
    )

    const isDev = process.env.NODE_ENV === 'development'
    // call getConfig the first time and show warnings if this is local dev env
    getConfig({ showWarnings: isDev })

    const redisClient = initRedis()
    // redisClient.on('error', err => console.log('Redis Client Error', err))

    // TODO: there might be mismatch between shared mongodb version
    // and API mongodb version
    // so the types such as "Db" are not exactly the same depending on the situation
    const db = (await getPublicDb()) as any

    // const entities = await loadOrGetEntities({})
    const context: RequestContext = { db, redisClient }

    const { surveys } = await loadOrGetSurveys()

    const questionObjects = getQuestionObjects({ surveys })

    const parsedSurveys = parseSurveys({ surveys })

    const typeObjects = await generateTypeObjects({ surveys: parsedSurveys, questionObjects })
    const allTypeDefsString = typeObjects.map(t => t.typeDef).join('\n\n')

    await logToFile('questionObjects.yml', questionObjects)
    await logToFile('typeDefs.yml', typeObjects)
    await logToFile('typeDefs.graphql', allTypeDefsString)

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
            const isDebug =
                expressContext?.req?.rawHeaders?.includes('http://localhost:4030') ||
                expressContext?.req?.rawHeaders?.includes('http://localhost:5030')
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

    /**
     * This URL can be used in a GitHub webhook
     * and surveyadmin app
     * @see https://docs.github.com/fr/webhooks
     */
    app.get('/reinitialize-entities', async function (req, res) {
        await checkSecretKey(req, res, async () => {
            // when entities change, also update surveys metadata
            await reinitialize({ context, initList: ['entities', 'surveys'] })
            res.status(200).send('Cache cleared')
        })
    })

    /**
     * Key must be passed as query param
     */
    app.get('/reinitialize-locales', async function (req, res) {
        await checkSecretKey(req, res, async () => {
            await reinitialize({ context, initList: ['locales'] })
            res.status(200).send('Locales reloaded')
        })
    })

    /**
     * Key must be passed as query param
     */
    app.get('/reinitialize-projects', async function (req, res) {
        await checkSecretKey(req, res, async () => {
            await initProjects({ context })
            res.status(200).send('Projects reinitialized')
        })
    })

    app.use('/gh', ghWebhooks(context))

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

    await watchFiles({
        context,
        config: {
            entities: getEnvVar(EnvVar.ENTITIES_PATH),
            surveys: getEnvVar(EnvVar.SURVEYS_PATH),
            locales: getEnvVar(EnvVar.LOCALES_PATH)
        }
    })

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
