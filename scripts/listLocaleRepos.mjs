#!/usr/bin/node

/**
 * A script to log t
 * 
* Expect node 18, no dependency
* NOTE: we could use google/zx too in the future
* or make this script part of surveyadmin
 */

function isLocaleRepo(r) {
    return r.name.match(/locale-*/)
}
function dedup(repos) {
    const seen = {}
    return repos.filter(({ name }) => {
        console.log("name", name)
        if (seen[name]) return false
        seen[name] = true
        return true
    })
}
async function run() {
    // See github API for result structure
    const p1 = await (await fetch("https://api.github.com/orgs/devographics/repos?perPage=100&page=1")).json()
    const p2 = await (await fetch("https://api.github.com/orgs/devographics/repos?perPage=100&page=2")).json()
    const p3 = await (await fetch("https://api.github.com/orgs/devographics/repos?perPage=100&page=3")).json()
    const localeRepos = dedup([...p1, ...p2, ...p3].filter(isLocaleRepo))
    // log useful commands
    console.log("LIST")
    localeRepos.forEach(localeRepo => console.log(`${localeRepo.name}`))
    console.log("CLONE COMMANDS (you may want to run them in devographics/locales folder)")
    localeRepos.forEach(localeRepo => console.log(`git clone ${localeRepo.clone_url}`))
    console.log(`UPDATE COMMANDS (run this in locales folder)`)
    // TODO: ideally the find would then trigger a git pull in each repo but I could only log the command instead of running it
    console.log(`find . -mindepth 1 -maxdepth 1 -type d -print0 | xargs -0 -I '%' echo "cd % && git pull && cd .."`)
    localeRepos.forEach(localeRepo => console.log(`cd ${localeRepo.name} && git pull && cd ..`))
}
run()
