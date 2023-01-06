import { Entity } from '@devographics/core-models'
import { GitHub, RequestContext } from '../types'
import projects from '../data/bestofjs.yml'
import { fetchMdnResource, fetchTwitterUser } from '../external_apis'
import { useCache } from '../caching'
import { getEntity } from '../entities'
import compact from 'lodash/compact.js'

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
        github: async ({ id }: { id: string }) => {
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
        mdn: async (entity: Entity, args: any, context: RequestContext) => {
            if (!entity || !entity.mdn) {
                return
            }

            const mdn = await useCache({
                func: fetchMdnResource,
                context,
                funcOptions: { path: entity.mdn }
            })

            if (mdn) {
                return mdn.find((t: any) => t.locale === 'en-US')
            } else {
                return
            }
        },
        twitter: async (entity: Entity, args: any, context: RequestContext) => {
            if (!entity || !entity.twitterName) {
                return
            }
            const twitter = await useCache({
                func: fetchTwitterUser,
                context,
                funcOptions: { twitterName: entity.twitterName }
            })

            return { ...twitter, url: `https://twitter.com/${entity.twitterName}` }
        },
        homepage: async (entity: Entity, args: any, context: RequestContext) => {
            const { homepage } = entity
            return homepage ? { name: entity.homepage, url: entity.homepage } : null
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
        },
        mastodon: async (entity: Entity, args: any, context: RequestContext) => {
            if (!entity || !entity.mastodonName) {
                return
            }
            const username = entity.mastodonName
            const [userName, server] = compact(username.split('@'))
            const url = `https://${server}/@${userName}`
            return { username, url }
        }
    }
}
