import { EntityResolvedFields, Entity, EntityAppearance } from '@devographics/types'
import { RequestContext } from '../types'
// import projects from '../data/bestofjs.yml'
import { fetchMdnResource, fetchTwitterUser } from '../external_apis'
import { computeKey, useCache } from '../helpers/caching'
import { getEntity } from '../load/entities'
import compact from 'lodash/compact.js'
import { getEntities } from '../load/entities'
import { loadOrGetSurveys } from '../load/surveys'
import { features } from 'web-features'

// const getSimulatedGithub = (id: string): GitHub | null => {
//     const project = projects.find((p: Entity) => p.id === id)

//     if (project !== undefined) {
//         const { name, description, github, stars, homepage } = project

//         return {
//             id,
//             name,
//             description,
//             url: `https://github.com/${github}`,
//             stars,
//             homepage
//         }
//     } else {
//         return null
//     }
// }

export const entitiesResolvers = {
    entity: async (root: any, { id }: { id: string }, context: RequestContext) => {
        console.log(`// entity resolver: ${id}`)
        return await getEntity({ id, context })
    },
    token: async (root: any, { id }: { id: string }, context: RequestContext) => {
        return await getEntity({ id, context, includeNormalizationEntities: true })
    },
    entities: async (
        root: any,
        {
            ids,
            tags,
            includeNormalizationEntities = false,
            includeAPIOnlyEntities = true
        }: {
            ids: string[]
            tags: string[]
            includeNormalizationEntities: boolean
            includeAPIOnlyEntities: boolean
        },
        context: RequestContext
    ) => {
        console.log(`// entities resolver ${ids ? `: ${ids.join(', ')}` : ''}`)

        return getEntities({
            ids,
            tags,
            context,
            includeNormalizationEntities,
            includeAPIOnlyEntities
        })
    }
}

export type EntityResolverMap = {
    [key in keyof EntityResolvedFields]: (
        entity: Entity,
        args: any,
        context: RequestContext,
        info: any
    ) => Promise<any>
}

export const entityResolverMap: EntityResolverMap = {
    github: async ({ id }) => {
        // note: for now just get local data from projects.yml
        // instead of actually querying github
        // return getSimulatedGithub(id)
        return {}
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
    mdn: async (entity, args, context) => {
        if (!entity || !entity.mdn) {
            return
        }

        const funcOptions = { path: entity.mdn }
        try {
            const mdn = await useCache({
                func: fetchMdnResource,
                key: computeKey(fetchMdnResource, funcOptions),
                context,
                funcOptions
            })

            if (mdn && Array.isArray(mdn)) {
                return mdn.find((t: any) => t.locale === 'en-US')
            } else {
                return
            }
        } catch (error) {
            return
        }
    },

    twitter: async (entity, args, context, info) => {
        if (!entity || !entity.twitterName) {
            return
        }

        // find out which fields on the twitter object are being queried for
        const queriedFields = info?.fieldNodes?.[0]?.selectionSet?.selections.map(
            (field: any) => field?.name?.value
        )
        // figure out if the request includes API fields (e.g. any field besides url and name)
        const hasAPIFields =
            queriedFields && queriedFields.some((f: any) => !['url', 'name'].includes(f))

        const funcOptions = { twitterName: entity.twitterName }
        const twitterAPIData = hasAPIFields
            ? await useCache({
                  func: fetchTwitterUser,
                  context,
                  funcOptions,
                  key: computeKey(fetchTwitterUser, funcOptions)
              })
            : {}

        return {
            ...twitterAPIData,
            name: entity.twitterName,
            url: `https://twitter.com/${entity.twitterName}`
        }
    },
    homepage: async entity => {
        return entity.homepageUrl && { url: entity.homepageUrl }
    },
    blog: async entity => {
        return entity.blog && { url: entity.blogUrl }
    },
    rss: async entity => {
        return entity.rss && { url: entity.rssUrl }
    },
    caniuse: async entity => {
        const { caniuse } = entity
        return caniuse ? { name: caniuse, url: `https://caniuse.com/${caniuse}` } : null
    },
    npm: async entity => {
        if (!entity || !entity.npm) {
            return
        }

        return { name: entity.npm, url: `https://www.npmjs.com/package/${entity.npm}` }
    },
    company: async entity => {
        const company = entity.companyName && getEntity({ id: entity.companyName })
        return company
    },
    mastodon: async entity => {
        if (!entity || !entity.mastodonName) {
            return
        }
        const name = entity.mastodonName
        const [userName, server] = compact(name.split('@'))
        const url = `https://${server}/@${userName}`
        return { name, url }
    },
    bluesky: async entity => {
        if (!entity || !entity.blueskyId) {
            return
        }
        const name = entity.blueskyId
        const url = `https://bsky.app/profile/${name}`
        return { name, url }
    },
    threads: async entity => {
        if (!entity || !entity.threadsId) {
            return
        }
        const name = entity.threadsId
        const url = `https://www.threads.net/@${name}`
        return { name, url }
    },
    youtube: async entity => {
        if (!entity) {
            return
        }
        const { youtubeUrl, homepageUrl } = entity
        const url =
            youtubeUrl ||
            (typeof homepageUrl === 'string' && homepageUrl.includes('youtube')
                ? homepageUrl
                : null)
        if (url) {
            return { url }
        } else {
            return
        }
    },
    twitch: async (entity: Entity) => {
        if (!entity) {
            return
        }
        const { twitchName, homepageUrl } = entity
        const url =
            (twitchName && `https://www.twitch.tv/${twitchName}`) ||
            (typeof homepageUrl === 'string' && homepageUrl?.includes('twitch')
                ? homepageUrl
                : null)
        if (url) {
            return { name: twitchName, url }
        } else {
            return
        }
    },
    webFeature: async (entity: Entity) => {
        if (!entity.webFeaturesId) {
            return
        }
        const webFeatureData = features[entity.webFeaturesId]
        if (webFeatureData) {
            const specArray = Array.isArray(webFeatureData.spec)
                ? webFeatureData.spec
                : [webFeatureData.spec]
            const groupArray = Array.isArray(webFeatureData.group)
                ? webFeatureData.group
                : [webFeatureData.group]
            const data = {
                ...webFeatureData,
                spec: specArray,
                group: groupArray,
                id: entity.webFeaturesId
            }
            return data
        }
    },
    appearsIn: async (entity: Entity) => {
        const { id } = entity
        const appearances: EntityAppearance[] = []
        const { surveys } = await loadOrGetSurveys()
        for (const survey of surveys) {
            for (const edition of survey.editions) {
                for (const section of edition.sections) {
                    for (const question of section.questions) {
                        if (question.id === id) {
                            appearances.push({ survey, edition, section, question, as: 'question' })
                        }
                        if (question.options) {
                            for (const option of question.options) {
                                if (option.id === id) {
                                    appearances.push({
                                        survey,
                                        edition,
                                        section,
                                        question,
                                        option,
                                        as: 'option'
                                    })
                                }
                            }
                        }
                    }
                }
            }
        }
        return appearances
    }
}
