import path from 'path'
import { existsSync } from 'fs'
import YAML from 'yamljs'
import { CaptureConfig, Sitemap } from './types'
import { captureLocales } from './locales'
import { logger, flushLogs } from './logger'

const CONFIG_DIR = 'config'
const CAPTURE_CONFIG_FILE = 'capture.yml'
const SITEMAP_FILE = 'sitemap.yml'

export const capture = async () => {
    const args = process.argv
    const resultsPath = args[2]
    if (!resultsPath) {
        logger.error(`no survey results path provided`)
        await flushLogs()
        process.exit(1)
    }

    const outputDir = args[3]
    if (!outputDir) {
        logger.error(`no output directory provided`)
        await flushLogs()
        process.exit(1)
    }

    const configDir = path.join(process.cwd(), resultsPath, CONFIG_DIR)
    console.log("configDir", configDir)
    if (!existsSync(configDir)) {
        logger.error(`unable to locate config dir: ${configDir}`)
        await flushLogs()
        process.exit(1)
    }

    const configFilePath = path.join(configDir, CAPTURE_CONFIG_FILE)
    console.log("configFilePath", configFilePath)
    if (!existsSync(configFilePath)) {
        logger.error(`unable to locate config file: ${configFilePath}`)
        await flushLogs()
        process.exit(1)
    }
    const config: CaptureConfig = YAML.load(configFilePath)

    const sitemapPath = path.join(configDir, SITEMAP_FILE)
    console.log("sitemapPath", sitemapPath)
    if (!existsSync(sitemapPath)) {
        logger.error(`Run: unable to locate sitemap: ${sitemapPath}`)
        await flushLogs()
        process.exit(1)
    }
    const sitemap: Sitemap = YAML.load(sitemapPath)

    await captureLocales({
        baseUrl: config.baseUrl,
        outputDir,
        sitemap,
    })
}
