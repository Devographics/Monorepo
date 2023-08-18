import Jimp from 'jimp'
import path from 'path'
import { readdir } from 'fs/promises'
import { parseCliConfig } from './cli'
import { MosaicConfig } from './types'

export const generateMosaicForLocale = async ({
    locale,
    config,
    outputDir,
}: {
    locale: string
    config: MosaicConfig
    outputDir: string
}) => {
    const localeScreenshotsDir = path.join(outputDir, locale)
    const files = await readdir(localeScreenshotsDir)
    const screenshotFiles = files
        .filter((file) => file.endsWith('.png') && file !== 'mosaic.png')
        .map((filename) => ({
            filename,
            path: path.join(localeScreenshotsDir, filename),
        }))

    const rows = Math.ceil(screenshotFiles.length / config.columns)
    const mosaic = new Jimp(
        config.thumb_width * config.columns,
        rows * config.thumb_height,
        config.background
    )

    process.stdout.write(
        `[${locale}] ${
            screenshotFiles.length
        } screenshots, dimensions: ${mosaic.getWidth()} x ${mosaic.getHeight()} (${
            config.columns
        } x ${rows})\n`
    )

    process.stdout.write('   ')
    Array.from({ length: config.columns }, (_, index) => index).forEach((column) => {
        process.stdout.write(`${column + 1} `.padEnd(3, ' '))
    })
    process.stdout.write('\n')

    let column = 0
    let row = 0
    process.stdout.write(`${row + 1} `.padStart(3, ' '))
    for (const screenshot of screenshotFiles) {
        const img = await Jimp.read(screenshot.path)
        img.scaleToFit(config.thumb_width, config.thumb_height)

        const xOffset = (config.thumb_width - img.getWidth()) / 2
        mosaic.composite(img, column * config.thumb_width + xOffset, row * config.thumb_height)

        process.stdout.write('.  ')
        if (column < config.columns - 1) {
            column++
        } else {
            process.stdout.write('\n')
            process.stdout.write(`${row + 2} `.padStart(3, ' '))
            column = 0
            row++
        }
    }
    process.stdout.write('\n')

    const mosaicFilePath = path.join(localeScreenshotsDir, 'mosaic.png')
    await mosaic.writeAsync(path.join(localeScreenshotsDir, 'mosaic.png'))
    process.stdout.write(`[${locale}] saved mosaic file (${mosaicFilePath})\n`)
}

export const mosaic = async () => {
    const config = await parseCliConfig()

    for (const locale of config.sitemap.locales) {
        await generateMosaicForLocale({
            locale: locale.id,
            config: config.mosaic,
            outputDir: config.outputDir,
        })
    }
}
