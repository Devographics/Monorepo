import { GitHub } from '../types'
import projects from '../data/bestofjs.yml'
import { fetchMdnResource, fetchTwitterUser } from '../external_apis'
import { useCache } from '../caching'
import type { Resolvers } from '../generated/graphql'

const getSimulatedGithub = (id: string): GitHub | null => {
    const project = projects.find((p) => p.id === id)

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

export const Entity: Resolvers['Entity'] = {
    github: async ({ id }) => {
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
    mdn: async (entity) => {
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
    twitter: async (entity, args, { db }) => {
        const twitter =
            entity.twitterName && useCache(fetchTwitterUser, db, [entity.twitterName])

        // const twitter = await fetchTwitterResource(entity.id)
        return twitter
    },
    homepage(entity) {
        return { name: entity.homepage, url: entity.homepage }
    },
    caniuse(entity) {
        const { caniuse } = entity
        return caniuse ? { name: caniuse, url: `https://caniuse.com/${caniuse}` } : null
    },
    npm(entity) {
        if (!entity || !entity.npm) {
            return
        }

        return { name: entity.npm, url: `https://www.npmjs.com/package/${entity.npm}` }
    }
}
