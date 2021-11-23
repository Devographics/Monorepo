import dotenv from 'dotenv'
dotenv.config()
import { ApolloServer } from 'apollo-server-express'
import { MongoClient } from 'mongodb'
import responseCachePlugin from 'apollo-server-plugin-response-cache'
import typeDefs from './type_defs/schema.graphql'
import { RequestContext } from './types'
import resolvers from './resolvers'
import express from 'express'
import { initLocales } from './i18n'
import { initEntities } from './entities'
import { analyzeTwitterFollowings } from './rpcs'
import { clearCache } from './caching'

// import Sentry from '@sentry/node'
// import Tracing from '@sentry/tracing'

import path from 'path'

const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')

const app = express()

const environment = process.env.ENVIRONMENT || process.env.NODE_ENV;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
    integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    // new Tracing.Integrations.Express({ app }),
  ],
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  environment,
});

// const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

const checkSecretKey = (req: any) => {
    if (req?.query?.key !== process.env.SECRET_KEY) {
        throw new Error('Authorization error')
    }
}

const start = async () => {
    const mongoClient = new MongoClient(process.env!.MONGO_URI!, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        connectTimeoutMS: 10000
    })
    await mongoClient.connect()
    const db = mongoClient.db(process.env.MONGO_DB_NAME)

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
        context: (): RequestContext => ({
            db
        })
    })

    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    // app.use(Sentry.Handlers.tracingHandler());

    await server.start()
    
    server.applyMiddleware({ app })

    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname + '/public/welcome.html'))
    })

    app.get('/debug-sentry', function mainHandler(req, res) {
    throw new Error('My first Sentry error!');
    });

    app.get('/analyze-twitter', async function (req, res) {
        checkSecretKey(req)
        analyzeTwitterFollowings()
        res.status(200).send('Analyzing…')
    })

    app.get('/clear-cache', async function (req, res) {
        checkSecretKey(req)
        clearCache(db)
        res.status(200).send('Cache cleared')
    })

    app.use(Sentry.Handlers.errorHandler());

    const port = process.env.PORT || 4000

    await initLocales()
    await initEntities()

    app.listen({ port: port }, () =>
        console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
    )

    
}

start()
