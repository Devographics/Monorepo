import { EnvVar, getEnvVar } from "@devographics/helpers"
export const getApiUrl = () => {
    const apiUrl = getEnvVar(EnvVar.API_URL) //process.env.API_URL
    if (!apiUrl) {
        throw new Error('process.env.API_URL not defined, it should point the the API')
    }
    return apiUrl
}