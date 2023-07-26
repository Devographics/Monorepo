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

import { getAllContexts, loadOrGetLocales } from '../../load/locales'
import { TypeDefTemplateOutput } from '../../types'

export const generateI18nContextsEnum = async ({
    path
}: {
    path: string
}): Promise<TypeDefTemplateOutput> => {
    await loadOrGetLocales()
    const allContexts = getAllContexts()
    const typeName = 'I18nContext'
    return {
        generatedBy: 'i18n_contexts_enum',
        path,
        typeName,
        typeDef: `enum ${typeName} {
    ${allContexts.join('\n    ')}
}`
    }
}
