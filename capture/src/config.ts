import path from 'path'
import { existsSync } from 'fs'
import YAML from 'yamljs'
import { CaptureConfig, Sitemap } from './types'
import { logger, flushLogs } from './logger'

// const CONFIG_DIR = 'config'
// const CAPTURE_CONFIG_FILE = 'capture.yml'
// const SITEMAP_FILE = 'sitemap.yml'

export const getConfig = async (configFilePath: string, outputDir: string, startFromLocale?: string) => {
    // const configDir = path.join(process.cwd(), configPath, CONFIG_DIR)
    // if (!existsSync(configDir)) {
    //     logger.error(`unable to locate config dir: ${configDir}`)
    //     await flushLogs()
    //     process.exit(1)
    // }

    // const configFilePath = path.join(configDir, CAPTURE_CONFIG_FILE)
    if (!existsSync(configFilePath)) {
        logger.error(`unable to locate config file: ${configFilePath}`)
        await flushLogs()
        process.exit(1)
    }
    const config: CaptureConfig = YAML.load(configFilePath)
    const configDirPath = configFilePath.split('/').slice(0, -1).join('/')
    const sitemapPath = path.join(configDirPath, config.sitemap)

    // const sitemapPath = path.join(configDir, SITEMAP_FILE)
    if (!existsSync(sitemapPath)) {
        logger.error(`unable to locate sitemap: ${sitemapPath}`)
        await flushLogs()
        process.exit(1)
    }
    const sitemap: Sitemap = YAML.load(sitemapPath)

    return {
        baseUrl: config.baseUrl,
        outputDir,
        sitemap,
        mosaic: config.mosaic,
        startFromLocale,
    }
}
