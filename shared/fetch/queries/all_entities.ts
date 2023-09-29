import { getEntityFragment } from './entity_fragment'

export const getEntitiesQuery = () => `
query EntitiesQuery {
  entities(includeNormalizationEntities: true, includeAPIOnlyEntities: false) {
    ${getEntityFragment({ isFull: true })}
  }
}
`
