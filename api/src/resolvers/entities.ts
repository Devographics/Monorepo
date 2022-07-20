import { GitHub, SurveyConfig, Entity, RequestContext } from '../types'
import projects from '../data/bestofjs.yml'
import { fetchMdnResource, fetchTwitterUser } from '../external_apis'
import { useCache } from '../caching'
import { getEntity } from '../entities'

const getSimulatedGithub = (id: string): GitHub | null => {
    const project = projects.find((p: Entity) => p.id === id)

    if (project !== undefined) {
        const { name, description, github, stars, homepage } = project

        return {
            id,
            name,
            description,
            url: `https://github.com/${github}`,
            stars,
            homepage
        }
    } else {
        return null
    }
}

export default {
    Entity: {
        github: async ({ id }: { survey: SurveyConfig; id: string }) => {
            // note: for now just get local data from projects.yml
            // instead of actually querying github
            return getSimulatedGithub(id)
            // const projectObject = projects.find(p => p.id === entity.id)
            // return {
            //     ...projectObject
            // }
            // if (!projectObject || !projectObject.github) {
            //     return
            // }
            // const github = await fetchGithubResource(projectObject.github)
            // return github
        },
        mdn: async (entity: Entity) => {
            if (!entity || !entity.mdn) {
                return
            }

            const mdn = await fetchMdnResource(entity.mdn)

            if (mdn) {
                return mdn.find((t: any) => t.locale === 'en-US')
            } else {
                return
            }
        },
        twitter: async (entity: Entity, args: any, context: RequestContext) => {
            const twitter =
                entity.twitterName && useCache(fetchTwitterUser, context, [entity.twitterName])

            // const twitter = await fetchTwitterResource(entity.id)
            return twitter
        },
        homepage: async (entity: Entity, args: any, context: RequestContext) => {
            return { name: entity.homepage, url: entity.homepage }
        },
        caniuse: async (entity: Entity, args: any, context: RequestContext) => {
            const { caniuse } = entity
            return caniuse ? { name: caniuse, url: `https://caniuse.com/${caniuse}` } : null
        },
        npm: async (entity: Entity, args: any, context: RequestContext) => {
            if (!entity || !entity.npm) {
                return
            }

            return { name: entity.npm, url: `https://www.npmjs.com/package/${entity.npm}` }
        },
        company: async (entity: Entity, args: any, context: RequestContext) => {
            const company = entity.companyName && getEntity({ id: entity.companyName })
            return company
        }
    }
}
