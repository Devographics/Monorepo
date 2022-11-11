import { ApolloServer } from 'apollo-server-express'
// @see https://github.com/apollographql/apollo-server/issues/6022
import responseCachePluginPkg from 'apollo-server-plugin-response-cache'
const responseCachePlugin = (responseCachePluginPkg as any).default

import typeDefs from './type_defs/schema.graphql'
import { RequestContext } from './types'
import resolvers from './resolvers'
import express from 'express'
import { createClient } from 'redis'

import path from 'path'

import Sentry from '@sentry/node'

import { rootDir } from './rootDir'
import { appSettings } from './settings'
import { init } from './init'

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
        url: appSettings.redisUrl
    })

    redisClient.on('error', err => console.log('Redis Client Error', err))

    if (appSettings.cacheType !== 'local') {
        await redisClient.connect()
    }

    const context = { redisClient }

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

    app.get('/debug-sentry', function mainHandler(req, res) {
        throw new Error('My first Sentry error!')
    })

    app.get('/reinitialize', async function (req, res) {
        checkSecretKey(req)
        await init({ context })
        res.status(200).send('Cache cleared')
    })

    app.use(Sentry.Handlers.errorHandler())

    const port = process.env.PORT || 4020

    await init({ context })

    app.listen({ port: port }, () =>
        console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
    )
}

start()
