import { RawLocale } from '@devographics/types'
import yaml from 'js-yaml'
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { EnvVar, getEnvVar } from '@devographics/helpers'
import { logToFile } from '@devographics/debug'

import { LoadAllOptions, addToAllContexts, excludedFiles, mergeLocales } from './locales'

// when developing locally, load from local files
export const loadAllLocally = async (options: LoadAllOptions = {}): Promise<RawLocale[]> => {
    const { localeIds, localeContexts = [] } = options
    let i = 0
    let locales: RawLocale[] = []

    const localesPathString = getEnvVar(EnvVar.LOCALES_PATH)
    if (!localesPathString) {
        throw new Error('LOCALES_PATH not set')
    }
    // localesPath can now be a comma-separated list of paths
    const localesPathArray = localesPathString.split(',')
    let pathIndex = 0
    for (const localesPath of localesPathArray) {
        pathIndex++
        const allLocalesDirPath = path.resolve(localesPath)

        const allFiles = await readdir(allLocalesDirPath)
        let allLocales = allFiles.filter(fileName => fileName.includes('locale-'))
        // if we only want to load specific locales, filter down allLocales to only keep those
        if (localeIds && localeIds.length > 0) {
            allLocales = allLocales.filter(localeName =>
                localeIds.includes(localeName.replace('locale-', ''))
            )
        }
        for (const localeDirName of allLocales) {
            const localeDirPath = `${allLocalesDirPath}/${localeDirName}`
            const localeConfigPath = `${allLocalesDirPath}/${localeDirName}/config.yml`
            const localeConfigContents = await readFile(localeConfigPath, 'utf8')
            const localeConfig: any = yaml.load(localeConfigContents)

            const localeRawData: RawLocale = { ...localeConfig, stringFiles: [] }
            i++
            console.log(`-> loading directory ${localeDirName} locally (${i}/${allLocales.length})`)

            const files = await readdir(localeDirPath)
            const yamlFiles = files.filter((f: String) => f.includes('.yml'))

            // loop over repo contents and fetch raw yaml files
            for (const fileName of yamlFiles) {
                if (!excludedFiles.includes(fileName)) {
                    const filePath = localeDirPath + '/' + fileName
                    const contents = await readFile(filePath, 'utf8')
                    const yamlContents: any = yaml.load(contents)
                    const strings = yamlContents.translations
                    const context = fileName.replace('./', '').replace('.yml', '')
                    if (localeContexts.length === 0 || localeContexts.includes(context)) {
                        addToAllContexts(context)
                        localeRawData.stringFiles.push({
                            strings,
                            url: filePath,
                            context
                        })
                    }
                }
            }
            logToFile(`locales_raw/filesystem_${localeConfig.id}_${pathIndex}.yml`, localeRawData)

            const existingLocaleIndex = locales.findIndex(l => l.id === localeRawData.id)
            if (existingLocaleIndex !== -1) {
                locales[existingLocaleIndex] = mergeLocales(
                    locales[existingLocaleIndex],
                    localeRawData
                )
            } else {
                locales.push(localeRawData)
            }
        }
    }
    return locales
}
