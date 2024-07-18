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

import { loadOrGetLocales } from '../../load/locales/locales'
import { TypeDefTemplateOutput } from '../../types'

export const generateLocaleIDEnum = async ({
    path
}: {
    path: string
}): Promise<TypeDefTemplateOutput> => {
    const allLocales = await loadOrGetLocales()
    const typeName = `LocaleID`
    return {
        generatedBy: 'locale_id_enum',
        path,
        typeName,
        typeDef: `enum ${typeName} {
    ${allLocales.map(l => l.id.replace('-', '_')).join('\n    ')}
}`
    }
}
