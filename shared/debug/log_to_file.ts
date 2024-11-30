import fs from 'fs'
import yaml from 'js-yaml'
import { parse } from 'graphql'
import { print } from 'graphql-print'
// @ts-ignore
import fsp from 'fs/promises'
import { concatPath } from '@devographics/helpers'

export type LogOptions = {
    mode?: 'append' | 'overwrite'
    timestamp?: boolean
    dirPath?: string
}

async function exists(path: string) {
    try {
        await fsp.access(path)
        return true
    } catch {
        return false
    }
}
function replacer(key: any, value: any) {
    if (value instanceof RegExp) return value.toString()
    else return value
}

const getExtension = (filePath: string) => filePath.split('.').at(-1) || 'none'

export const logToFile = async (filePath: string, object: any, options: LogOptions = {}) => {
    if (process.env.NODE_ENV === 'development') {
        const extension = getExtension(filePath)
        const { mode = 'overwrite', timestamp = false, dirPath } = options
        const envLogsDirPath = process.env.LOGS_PATH

        if (!envLogsDirPath) {
            console.warn('📄 Please define LOGS_PATH in your .env file to enable logging')
            return
        }

        const relativeDirPathSegments = filePath.split('/').slice(0, -1)
        const relativeDirPath = relativeDirPathSegments.join('/')
        const fileName = filePath.split('/').at(-1) || ''

        const logsDirPath = concatPath(envLogsDirPath, relativeDirPath)

        if (!fs.existsSync(logsDirPath)) {
            fs.mkdirSync(logsDirPath, { recursive: true })
        }
        const fullPath = concatPath(logsDirPath, fileName)
        // console.debug(`📄 Creating log file file://${fullPath}`)

        let contents
        if (typeof object === 'string') {
            contents = object
            if (['gql', 'graphql'].includes(extension)) {
                try {
                    const ast = parse(object)
                    contents = print(ast, { preserveComments: true })
                } catch (error: any) {
                    console.warn(
                        `📄 ‼️  logToFile ${fileName}: error when parsing GraphQL content (${JSON.stringify(
                            error.locations
                        )}).`
                    )
                }
            }
        } else {
            if (['yml', 'yaml'].includes(extension)) {
                contents = yaml.dump(object, { noRefs: true, skipInvalid: true })
            } else {
                contents = JSON.stringify(object, replacer, 2)
            }
        }
        if (!contents) {
            return
        }
        const now = new Date()
        const text = timestamp ? now.toString() + '\n---\n' + contents : contents
        if (mode === 'append') {
            const stream = fs.createWriteStream(fullPath, { flags: 'a' })
            stream.write(text + '\n')
            stream.end()
        } else {
            await fsp.writeFile(fullPath, text)
        }
    }
}
