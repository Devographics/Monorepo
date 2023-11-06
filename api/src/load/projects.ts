import fetch from 'node-fetch'
import { RequestContext } from '../types'
import { getProjectsCollection } from '@devographics/mongo'

const formatId = (id: string) => id?.replaceAll('-', '_')

const idFieldName = 'slug'

export const initProjects = async ({ context }: { context: RequestContext }) => {
    const { db } = context
    const projectsCollection = await getProjectsCollection()

    console.log('// Adding Best of JS projects to DB…')
    await projectsCollection.deleteMany({})

    const response = await fetch('https://bestofjs-static-api.vercel.app/projects-full.json')
    const BestOfJSData: any = await response.json()
    const projectsData = BestOfJSData.projects.filter((p: any) => !!p[idFieldName])

    // format all ids (- to _)
    let data = projectsData.map((project: any) => {
        const id = formatId(project[idFieldName])
        return { ...project, _id: id, id }
    })
    // TODO: filter out any project that is already in entities
    await projectsCollection.insertMany(data)
    console.log(`  -> Inserted ${projectsData.length} projects.`)
}
