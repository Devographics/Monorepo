import dotenv from 'dotenv'
dotenv.config()
import { MongoClient } from 'mongodb'
import { inspect } from 'util'
import { computeToolExperienceTransitions } from './compute'

const naive = async (collection: any) => {
    const res = await collection.find({
        survey: 'state_of_js',
        year: {
            '$gte': 2018
        },
        'user_info.hash': {
            '$nin': [null, '', []]
        },
        'tools.ember.experience': {
            '$nin': [null, '', []]
        }
    })
        .project({
            'year': true,
            'user_info.hash': true,
            'tools.ember.experience': true
        })

    const byHash: any = {}
    for await (const doc of res) {
        const hash = doc.user_info.hash
        if (!byHash[hash]) {
            byHash[hash] = {
                hash,
                answers: []
            }
        }

        byHash[hash].answers.push({
            year: doc.year,
            choice: doc.tools.ember.experience
        })
    }

    const filtered = Object.values(byHash)
        .filter((bucket: any) => bucket.answers.length > 1)
    filtered.forEach((bucket: any) => {
        bucket.answers.sort((a: any, b: any) => a.year - b.year)
    })

    // console.log(inspect(filtered,{ depth: null, colors: true }))
    // console.log('------------->', filtered.length)

    const aggs: Record<number,
        Record<string, number>> = {}

    const nodes: Record<string, {
        id: string
        year: number
        choice: string
    }> = {}
    const links: Record<string, {
        source: string
        target: string
        value: number
    }> = {}

    filtered.forEach((bucket: any) => {
        bucket.answers.forEach((year: any) => {
            const nextYear = bucket.answers.find((y: any) => y.year === year.year + 1)
            if (!nextYear) return

            const currentId = `${year.choice}-${year.year}`
            if (!nodes[currentId]) {
                nodes[currentId] = {
                    id: currentId,
                    year: year.year,
                    choice: year.choice
                }
            }

            const nextId = `${nextYear.choice}-${nextYear.year}`
            if (!nodes[nextId]) {
                nodes[nextId] = {
                    id: nextId,
                    year: nextYear.year,
                    choice: nextYear.choice
                }
            }

            const linkId = `${currentId} -> ${nextId}`
            if (!links[linkId]) {
                links[linkId] = {
                    source: currentId,
                    target: nextId,
                    value: 0
                }
            }
            links[linkId].value += 1

            if (!aggs[year.year]) {
                aggs[year.year] = {}
            }
            if (!aggs[year.year][linkId]) {
                aggs[year.year][linkId] = 0
            }
            aggs[year.year][linkId] += 1
        })
    })

    const nodesArray = Object.values(nodes)
    const choiceRanks = {
        never_heard: 1,
        interested: 2,
        not_interested: 3,
        would_use: 4,
        would_not_use: 5
    }
    nodesArray.sort((a, b) => {
        // @ts-ignore
        return choiceRanks[a.choice] - choiceRanks[b.choice]
    })

    console.log(inspect(aggs, { depth: null, colors: true }))
    console.log('\n\n-------------------------------------------\n\n')
    console.log(inspect({ nodes, links }, { depth: null, colors: true }))
    console.log('\n\n-------------------------------------------\n\n')
    console.log(JSON.stringify({
        nodes: nodesArray,
        links: Object.values(links)
    }, null, '    '))
}



const run = async () => {
    const mongoClient = new MongoClient(process.env!.MONGO_URI!, {
        connectTimeoutMS: 1000
    })
    await mongoClient.connect()
    const db = mongoClient.db(process.env.MONGO_DB_NAME)

    // await naive(collection)
    const res = await computeToolExperienceTransitions(
        db,
        { survey: 'state_of_js' },
        'ember',
        [2019, 2020],
    )
    // console.log(inspect(res.ember,{ depth: null, colors: true }))
    // console.log('\n\n\n-------------------------------\n\n\n')

    console.log(JSON.stringify({
        nodes: res.nodes,
        transitions: res.transitions,
    }, null, '    '))

    await mongoClient.close()
}

run()
