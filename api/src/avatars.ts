import { RequestContext } from './types'
import get from 'lodash/get.js'
import path from 'path'
import fs from 'fs'
import fetch from 'node-fetch'
import { loadOrGetEntities, findEntity, applyEntityResolvers } from './entities'
import sharp from 'sharp'
import { fetchTwitterUser } from './external_apis'
import { useCache } from './caching'
import { Entity } from '@devographics/core-models'

const services = { twitter: { fieldName: 'avatarUrl' } }

// const fileExtensions = ['png', 'svg', 'jpg', 'jpeg', 'webp', 'gif']

const downloadAndConvertImage = async ({ fileUrl, filePath }) => {
    try {
        const response = await fetch(fileUrl)
        const fileData = await response.buffer()

        // Convert and resize the image
        const output = await sharp(fileData)
            .resize(500, 500, { withoutEnlargement: true })
            .toFormat('jpg')
            .toBuffer()

        await fs.promises.writeFile(filePath, output)
        console.log(`// Downloaded ${fileUrl} and saved it to ${filePath}`)
    } catch (err) {
        console.log(`An error occurred: ${err.message}`)
    }
}

const fileExists = async filePath => {
    try {
        await fs.promises.access(filePath)
        return true
    } catch (err) {
        return false
    }
}

/*

If the entity has a twitterName use it, else if it belongs to *another* entity
use *its* twitterName to get Twitter metadata (especially the avatar)

Note: no matter which twitterName we use we still save its avatar
under the id of the "child" entity, *not* the "owner" entity

*/
const getTwitterName = (entity: Entity, entities: Entity[]) => {
    const { twitterName, belongsTo } = entity
    if (twitterName) {
        return twitterName
    } else if (belongsTo) {
        const ownerEntity = findEntity(belongsTo, entities)
        return ownerEntity?.twitterName
    }
    return
}

const tags = ['people', 'video_creators']

export const cacheAvatars = async ({ context }: { context: RequestContext }) => {
    console.log('// cacheAvatars')

    const avatarsDirPath = path.resolve(`../../${process.env.IMAGES_DIR}/avatars`)

    const entities = await loadOrGetEntities()

    const entitiesWithAvatars = entities.filter(e => e.tags?.some(tag => tags.includes(tag)))

    for (const entity of entitiesWithAvatars) {
        const avatarFilePath = `${avatarsDirPath}/${entity.id}`
        // const allExtensionsExist = await Promise.all(
        //     fileExtensions.map(ext => fileExists(`${avatarFilePath}.${ext}`))
        // )
        // const avatarFileExists = allExtensionsExist.includes(true)
        const avatarFileExists = await fileExists(`${avatarFilePath}.jpg`)
        if (!avatarFileExists) {
            // method 1: apply resolvers
            // const entityWithResolvers = await applyEntityResolvers(entity, context)

            const twitterName = getTwitterName(entity, entities)

            // method 2: manually add twitter API data to entity
            const twitter = await useCache({
                func: fetchTwitterUser,
                context,
                funcOptions: { twitterName }
            })
            const entityWithResolvers = { ...entity, twitter }

            for (const serviceName of Object.keys(services)) {
                const service = services[serviceName]
                const { fieldName } = service
                const avatarUrlPath = `${serviceName}.${fieldName}`
                const avatarUrl = get(entityWithResolvers, avatarUrlPath)

                if (avatarUrl) {
                    // const avatarExtension = avatarUrl.split('.').at(-1)
                    await downloadAndConvertImage({
                        fileUrl: avatarUrl,
                        filePath: `${avatarFilePath}.jpg`
                    })
                } else {
                    // console.log(`// No avatarUrl found for entity ${entity.id}`)
                    // console.log(entityWithResolvers)
                }
            }
        }
    }
}
