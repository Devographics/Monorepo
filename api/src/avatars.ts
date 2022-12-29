import { RequestContext } from './types'
import get from 'lodash/get.js'
import path from 'path'
import fs from 'fs'
import fetch from 'node-fetch'
import { loadOrGetEntities, applyEntityResolvers } from './entities'
import sharp from 'sharp'

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

export const cacheAvatars = async ({ context }: { context: RequestContext }) => {
    console.log('// cacheAvatars')

    const avatarsDirPath = path.resolve(`../../${process.env.IMAGES_DIR}/avatars`)

    const entities = await loadOrGetEntities()

    const peopleEntities = entities.filter(e => e.tags?.includes('people'))

    for (const entity of peopleEntities) {
        const avatarFilePath = `${avatarsDirPath}/${entity.id}`
        // const allExtensionsExist = await Promise.all(
        //     fileExtensions.map(ext => fileExists(`${avatarFilePath}.${ext}`))
        // )
        // const avatarFileExists = allExtensionsExist.includes(true)
        const avatarFileExists = await fileExists(`${avatarFilePath}.jpg`)
        if (!avatarFileExists) {
            const entityWithResolvers = await applyEntityResolvers(entity, context)

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
