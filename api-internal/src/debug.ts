import fs, { promises as fsAsync } from 'fs'

const logsDirectory = '.logs';

export const logToFile = async (fileName: string, object: any, options: any = {}) => {
    const { mode = 'append', timestamp = false } = options
    // __dirname = /Users/sacha/Dev/state-of-js-graphql-results-api/dist
    const path = __dirname.split('/').slice(1, -1).join('/')
    const logsDirPath = `/${path}/${logsDirectory}`
    if (!fs.existsSync(logsDirPath)) {
        fs.mkdirSync(logsDirPath, { recursive: true })
    }
    const fullPath = `${logsDirPath}/${fileName}`
    const contents = typeof object === 'string' ? object : JSON.stringify(object, null, 2)
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
