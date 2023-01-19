import ids from './data/ids.yml'
import countries from './data/countries.yml'
import yamlKeys from './data/keys.yml'

export const getMetaData = () => {
    const keys = {}
    for (let k in yamlKeys) {
        keys[k] = yamlKeys[k].map(k => (typeof k === 'object' ? k : { id: k }))
    }
    const keysWithCountries = { ...keys, country: countries.map(c => ({ id: c })) }
    return {
        ids,
        keys: keysWithCountries
    }
}
