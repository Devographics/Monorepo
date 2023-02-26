// import ids from './data/ids.yml'
// import countries from './data/countries.yml'
// import yamlKeys from './data/keys.yml'
// import { getEntities } from './load/entities'
// import { getCache } from './helpers/caching'
// import { RequestContext } from './types'

// export const getAllLocalesMetadataCacheKey = () => 'locale_all_locales_metadata'

// export const getMetaData = async ({ context }: { context: RequestContext }) => {
//     let keys = {}
//     for (let k in yamlKeys) {
//         keys[k] = yamlKeys[k].map(k => (typeof k === 'object' ? k : { id: k }))
//     }

//     const entities = await getEntities({})

//     // decorate sources with entities
//     keys.source.forEach(sourceEntity => {
//         const entity = entities.find(e => e.id === sourceEntity.id)
//         sourceEntity.entity = entity
//     })

//     // add locales
//     const allLocales = await getCache(getAllLocalesMetadataCacheKey(), context)
//     keys.locale = allLocales.map(({ id, label }) => ({ id, label }))

//     // add countries
//     keys.country = countries.map(c => ({ id: c }))

//     return {
//         ids,
//         keys
//     }
// }
