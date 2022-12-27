import { initMemoryCache } from './init'
import { RequestContext, WatchedItem } from './types'
import chokidar from 'chokidar'
import path from 'path'

type Config = {
    [K in WatchedItem]?: string
}

const ignored = [/(^|[\/\\])\../, /(.*).png/, /(.*).svg/, /(.*).json/, /(.*).graphql/, /(.*).md/]

// Something to use when events are received.
const log = console.log.bind(console)

export const watchFiles = async ({
    context,
    config
}: {
    context: RequestContext
    config: Config
}) => {
    console.log(1)
    const items = Object.keys(config) as WatchedItem[]
    console.log(2)

    for (const itemType of items) {
        const dirName = config[itemType]
        const dirPath = path.resolve(`../../${dirName}/`)
        console.log(3)

        // Initialize watcher.
        const watcher = chokidar.watch(dirPath, {
            ignored,
            persistent: true
        })
        console.log(4)

        watcher
            .on('add', path => {
                log(`File ${path} has been added`)
            })
            .on('change', async path => {
                log(`File ${path} has been changed`)
                await initMemoryCache({ context, initList: [itemType] })
            })
    }
}
