// Helpers to load the surveys locally after having cloned
// devographics/surveys
//
// @see api/src/surveys.ts

// @ts-ignore fs/promises is not systematically found, 
// this file is perhaps not transpiled as a server package
import { readdir, readFile, lstat } from 'fs/promises'
import path from "path"
import { SurveyEditions } from "../typings"
import yaml from "js-yaml"

// Surveys may have been cloned from github, only keep valid files
const excludeDirs = ['.git', '.DS_Store']

// when developing locally, load from local files
/**
 * Expects "SURVEY_DIR" env variable to be set,
 * relative to the monorepo root
 * 
 * TODO: Not yet usable in surveyform
 * the SurveyEditions structure comes from /api
 * But the surveyform expect either a specific survey, or a list of survey generic description
 */
export const loadSurveysLocally = async (): Promise<Array<SurveyEditions>> => {
    const surveysDirPath = path.resolve(path.join(__dirname, `../../${process.env.SURVEYS_DIR}/`))
    console.log(`-> loading surveys locally at path ${surveysDirPath}`)
    const surveys: Array<SurveyEditions> = []
    const surveysDirs = await readdir(surveysDirPath)

    // loop over dir contents and fetch raw yaml files
    for (const surveyDirName of surveysDirs) {
        const editions: Array<any> = []
        const surveyDirPath = surveysDirPath + '/' + surveyDirName
        const stat = await lstat(surveyDirPath)
        // not a syurvey directory
        if (excludeDirs.includes(surveyDirName) || !stat.isDirectory()) {
            continue

        }
        console.log(`// Loading survey ${surveyDirName}…`)

        // survey main config
        const surveyConfigContents = await readFile(surveyDirPath + '/config.yml', 'utf8')
        const surveyConfigYaml: any = yaml.load(surveyConfigContents)
        const editionsDirs = await readdir(surveyDirPath)

        for (const editionDirName of editionsDirs) {
            const editionDirPath = `${surveyDirPath}/${editionDirName}`
            const stat = await lstat(editionDirPath)
            // not a year folder
            if (excludeDirs.includes(editionDirName) && !stat.isDirectory()) {
                continue
            }
            console.log(`\t\t-> Edition ${editionDirName}…`)
            let edition
            try {
                const editionConfigContents = await readFile(
                    editionDirPath + '/config.yml',
                    'utf8'
                )
                const editionConfigYaml: any = yaml.load(editionConfigContents)
                edition = editionConfigYaml
            } catch (error) { }
            try {
                const editionQuestionsContents = await readFile(
                    editionDirPath + '/questions.yml',
                    'utf8'
                )
                const editionQuestionsYaml: any = yaml.load(editionQuestionsContents)
                edition.questions = editionQuestionsYaml
            } catch (error) { }
            editions.push(edition)
        }
        const survey = { ...surveyConfigYaml, editions }
        surveys.push(survey)
    }
    return surveys
}