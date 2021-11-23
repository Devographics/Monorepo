import dotenv from 'dotenv'
dotenv.config()
import { MongoClient } from 'mongodb'
import { inspect } from 'util'
import {
    computeChoicesOverYearsGraph
} from './compute'

const run = async () => {
    const mongoClient = new MongoClient(process.env!.MONGO_URI!, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        connectTimeoutMS: 1000
    })
    await mongoClient.connect()
    const db = mongoClient.db(process.env.MONGO_DB_NAME)

    const res = await computeChoicesOverYearsGraph(
        db,
        { survey: 'js' },
        'tools.typescript.experience'
    )

    console.log(inspect(res, { depth: null, colors: true }))

    await mongoClient.close()
}

run()
