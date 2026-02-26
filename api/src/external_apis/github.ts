import { EnvVar, getEnvVar } from '@devographics/helpers'
import fetch from 'node-fetch'
import * as crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { Octokit } from '@octokit/core'

// generic utilties

export const normalizeGithubResource = (res: any) => {
    return {
        name: res.name,
        full_name: res.full_name,
        description: res.description,
        url: res.html_url,
        stars: res.stargazers_count,
        forks: res.forks,
        opened_issues: res.open_issues_count,
        homepage: res.homepage
    }
}

/*
Unused at the moment
export const fetchGithubResource = async (ownerAndRepo: string) => {
    try {
        const res = await fetch(`https://api.github.com/repos/${ownerAndRepo}`, {
            headers: { Authorization: `token ${getEnvVar(EnvVar.GITHUB_TOKEN)}` }
        })
        const json = await res.json()
        const data = normalizeGithubResource(json)
        return data
    } catch (error) {
        console.error(`an error occurred while fetching github resource`, error)
        throw error
    }
}
*/

// files

let octokit: Octokit
export const getOctokit = () => {
    if (!octokit) {
        octokit = new Octokit({
            auth: getEnvVar(EnvVar.GITHUB_TOKEN, { hardFail: true, calledFrom: 'getOctokit' })
        })
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

export const getRepoSHA = async ({ owner, repo }: { owner: string; repo: string }) => {
    const octokit = getOctokit()
    const commits = await octokit.request('GET /repos/{owner}/{repo}/commits?per_page=1&page=1', {
        owner,
        repo
    })
    return commits.data?.[0]?.sha
}

// Web hooks

const verifyGhWebhookSignature = (secret: string, body: any, xHubSignature256: string) => {
    const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex')
    let trusted = Buffer.from(`sha256=${signature}`, 'ascii')
    let untrusted = Buffer.from(xHubSignature256, 'ascii')
    return crypto.timingSafeEqual(trusted, untrusted)
}

/**
 * GitHub webhooks allow reloading the API on locales/entities/surveys changes
 * @see https://docs.github.com/en/webhooks/using-webhooks/securing-your-webhooks
 */
export const verifyGhWebhookMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const secretKey = getEnvVar(EnvVar.SECRET_KEY, {
        hardFail: true,
        calledFrom: 'verifyGhWebhookMiddleware'
    })
    const signature = req.headers?.['x-hub-signature-256']
    if (!signature) return res.status(400).send('Missing GitHub signature')
    if (Array.isArray(signature))
        return res.status(400).send('GitHub signature must be a single value')
    if (!verifyGhWebhookSignature(secretKey, req.body, signature)) {
        return res.status(401).send('Wrong signature, GitHub hook secret might be misconfigured')
    }
    next()
}

export async function checkMainPushAction(req: Request, res: Response, next: NextFunction) {
    // @see https://docs.github.com/en/webhooks/webhook-events-and-payloads#push
    const action = req.headers?.['x-github-event']
    const { ref /*, repository, sender */ } = req.body
    if (!(action === 'push' && ref === 'refs/heads/main')) {
        return res.status(200).send(`Nothing to do for action ${action} on ref ${ref}`)
    }
    next()
}
