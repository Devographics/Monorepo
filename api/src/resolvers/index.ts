import categories from './categories'
import demographics from './demographics'
import entities from './entities'
import environments from './environments'
import features from './features'
import otherFeatures from './features_others'
import happiness from './happiness'
import matrices from './matrices'
import opinions from './opinions'
import proficiency from './proficiency'
import query from './query'
import resources from './resources'
import surveys from './surveys'
import totals from './totals'
import tools from './tools'
import otherTools from './tools_others'
import brackets from './brackets'

export default {
    ...surveys,
    ...totals,
    ...demographics,
    ...categories,
    ...opinions,
    ...features,
    ...matrices,
    ...tools,
    ...otherFeatures,
    ...otherTools,
    ...resources,
    ...entities,
    ...environments,
    ...proficiency,
    ...happiness,
    ...query,
    ...brackets,
}
