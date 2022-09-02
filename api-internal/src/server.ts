import dotenv from 'dotenv'
// NOTE: when building as ESM, it seems that modules logic will be run
// BEFORE server.ts => be careful on top-level code that uses process.env,
// values might be undefined
dotenv.config()

import { ApolloServer } from 'apollo-server-express'
// @see https://github.com/apollographql/apollo-server/issues/6022
import responseCachePluginPkg from 'apollo-server-plugin-response-cache'
const responseCachePlugin = (responseCachePluginPkg as any).default

import typeDefs from './type_defs/schema.graphql'
import { RequestContext } from './types'
import resolvers from './resolvers'
import express from 'express'
import { initLocales } from './locales_cache'
import { initEntities } from './entities'
import { createClient } from 'redis'

import path from 'path'

import Sentry from '@sentry/node'

// @see https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
// /!\ __dirname must be recomputed for each file, don't try to move this code
import * as url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
//const __filename = url.fileURLToPath(import.meta.url)

//import Tracing from '@sentry/tracing'

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

const checkSecretKey = (req: any) => {
    if (req?.query?.key !== process.env.SECRET_KEY) {
        throw new Error('Authorization error')
    }
}

const start = async () => {
    const redisClient = createClient({
        url: process.env.REDIS_URL
    })

    redisClient.on('error', err => console.log('Redis Client Error', err))

    if (process.env.CACHE_TYPE !== 'local') {
        await redisClient.connect()
    }

    const server = new ApolloServer({
        typeDefs,
        resolvers: resolvers as any,
        debug: isDev,
        // tracing: isDev,
        // cacheControl: true,
        introspection: true,
        // playground: false,
        plugins: [responseCachePlugin()],
        // engine: {
        //     debugPrintReports: true
        // },
        context: (expressContext): RequestContext => {
            // TODO: do this better with a custom header
            const isDebug = expressContext?.req?.rawHeaders?.includes('http://localhost:4002')
            return {
                redisClient,
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
        console.log('dirname value in server.ts', __dirname)
        res.sendFile(path.join(__dirname + '/public/welcome.html'))
    })

    app.get('/debug-sentry', function mainHandler(req, res) {
        throw new Error('My first Sentry error!')
    })

    app.get('/clear-cache', async function (req, res) {
        checkSecretKey(req)
        // clearCache(db)
        res.status(200).send('Cache cleared')
    })

    app.use(Sentry.Handlers.errorHandler())

    const port = process.env.PORT || 4020

    await initLocales({ redisClient })
    await initEntities()

    app.listen({ port: port }, () =>
        console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
    )
}

start()
