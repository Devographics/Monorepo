import fetch from 'node-fetch'
import { appSettings } from '../settings'

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

export const fetchGithubResource = async (ownerAndRepo: string) => {
    try {
        const res = await fetch(`https://api.github.com/repos/${ownerAndRepo}`, {
            headers: { Authorization: `token ${appSettings.githubToken}` }
        })
        const json = await res.json()
        const data = normalizeGithubResource(json)
        return data
    } catch (error) {
        console.error(`an error occurred while fetching github resource`, error)
        throw error
    }
}
