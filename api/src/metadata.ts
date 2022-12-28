import ids from './data/ids.yml'
import keys from './data/keys.yml'
import countries from './data/countries.yml'

export const getMetaData = () => {
    const keysWithCountries = { ...keys, country: countries }
    return {
        ids,
        keys: keysWithCountries
    }
}
