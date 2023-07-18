/*

Sample output:

enum I18nContexts {
    common
    homepage
    results
    accounts
    surveys

    state_of_js
    state_of_css
}
*/

import { loadOrGetLocales } from '../../load/locales'

export const generateLocaleIDEnum = async ({ path }: { path: string }) => {
    const allLocales = await loadOrGetLocales()
    const typeName = `LocaleID`
    return {
        path,
        typeName,
        typeDef: `enum ${typeName} {
    ${allLocales.map(l => l.id.replace('-', '_')).join('\n    ')}
}`
    }
}
