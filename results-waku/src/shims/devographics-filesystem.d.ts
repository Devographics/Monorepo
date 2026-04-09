declare module '@devographics/filesystem' {
    export function getLocalJSON(args: { localPath: string }): Promise<unknown>
    export function getLocalString(args: { localPath: string }): Promise<string | undefined>
}
