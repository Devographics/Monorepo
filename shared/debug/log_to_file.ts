import fs from 'fs'
import yaml from 'js-yaml'
import { parse } from 'graphql'
import { print } from 'graphql-print'

export type LogOptions = {
    mode?: 'append' | 'overwrite'
    timestamp?: boolean
    dirPath?: string
    subDir?: string
}

export const logToFile = async (fileName_: string, object: any, options: LogOptions = {}) => {
    if (process.env.NODE_ENV === 'development') {
        let fileName = fileName_,
            subDir = options?.subDir
        const { mode = 'overwrite', timestamp = false, dirPath } = options
        const envLogsDirPath = process.env.LOGS_PATH

        if (!envLogsDirPath) {
            console.warn('Please define LOGS_PATH in your .env file to enable logging')
            return
        }

        if (fileName.includes('/')) {
            subDir = fileName.split('/')[0]
            fileName = fileName.split('/')[1]
        }

        const logsDirPath = dirPath ?? (subDir ? `${envLogsDirPath}/${subDir}` : envLogsDirPath)

        if (!fs.existsSync(logsDirPath)) {
            fs.mkdirSync(logsDirPath, { recursive: true })
        }
        const fullPath = `${logsDirPath}/${fileName}`
        let contents
        if (typeof object === 'string') {
            if (fileName.includes('.gql') || fileName.includes('.graphql')) {
                try {
                    const ast = parse(object)
                    contents = print(ast, { preserveComments: true })
                } catch (error) {
                    console.warn(error)
                    console.warn(object)
                }
            } else {
                contents = object
            }
        } else {
            if (fileName.includes('.yml') || fileName.includes('.yaml')) {
                contents = yaml.dump(object, { noRefs: true, skipInvalid: true })
            } else {
                contents = JSON.stringify(object, null, 2)
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
            fs.readFile(fullPath, (error, data) => {
                let shouldWrite = false
                if (error && error.code === 'ENOENT') {
                    // the file just does not exist, ok to write
                    shouldWrite = true
                } else if (error) {
                    // maybe EACCESS or something wrong with the disk
                    throw error
                } else {
                    const fileContent = data.toString()
                    if (fileContent !== text) {
                        shouldWrite = true
                    }
                }

                if (shouldWrite) {
                    fs.writeFile(fullPath, text, error => {
                        // throws an error, you could also catch it here
                        if (error) throw error

                        // eslint-disable-next-line no-console
                        console.log(`Log saved to ${fullPath}`)
                    })
                }
            })
        }
    }
}
