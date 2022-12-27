import { initMemoryCache } from './init'
import { RequestContext, WatchedItem } from './types'
import chokidar from 'chokidar'
import path from 'path'

type Config = {
    [K in WatchedItem]: string
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
    const items = Object.keys(config) as WatchedItem[]
    for (const itemType of items) {
        const dirName = config[itemType]
        const dirPath = path.resolve(`../../${dirName}/`)

        // Initialize watcher.
        const watcher = chokidar.watch(dirPath, {
            ignored,
            persistent: true
        })

        watcher
            .on('add', path => {
                log(`File ${path} has been added`)
            })
            .on('change', path => {
                log(`File ${path} has been changed`)
                initMemoryCache({ context, initList: [itemType] })
            })
    }
}
