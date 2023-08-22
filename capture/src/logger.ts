import { createLogger, format, transports, transport as Transport } from 'winston'

export const logger = createLogger({
    level: 'debug',
    format: format.simple(),
    transports: [
        new transports.File({
            filename: 'capture.log',
            options: { flags: 'w' },
            level: 'info',
            format: format.combine(format.timestamp(), format.prettyPrint()),
        }),
        new transports.Console({
            format: format.simple(),
        }),
    ],
    exitOnError: false,
})

const closeWinstonTransportAndWaitForFinish = async (transport: Transport) => {
    if (!transport.close) {
        return Promise.resolve()
    }

    return new Promise<void>(async (resolve, _reject) => {
        // @ts-ignore
        transport._doneFinish = false
        const done = () => {
            // @ts-ignore
            if (transport._doneFinish) {
                return // avoid resolving twice, for example timeout after successful 'finish' event
            }
            // @ts-ignore
            transport._doneFinish = true
            resolve()
        }
        // in case the 'finish' event never occurs
        setTimeout(done, 100)

        transport.once('finish', done)
        // @ts-ignore
        transport.close()
    })
}

export const flushLogs = async () =>
    new Promise<void>(async (resolve, _reject) => {
        for (const transport of logger.transports) {
            try {
                await closeWinstonTransportAndWaitForFinish(transport)
            } catch (err) {
                console.log(err)
            }
        }

        resolve()
    })
