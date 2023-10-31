import { Octokit } from '@octokit/core'
import { EnvVar, getEnvVar } from '@devographics/helpers'

let octokit: Octokit
const getOctokit = () => {
    if (!octokit) {
        octokit = new Octokit({ auth: getEnvVar(EnvVar.GITHUB_TOKEN) })
    }
    return octokit
}
export const listGitHubFiles = async ({
    owner,
    repo,
    path
}: {
    owner: string
    repo: string
    path: string
}) => {
    const octokit = getOctokit()
    const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path
    })
    return contents.data as any[]
}