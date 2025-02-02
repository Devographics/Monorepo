import { FeaturesOptions } from '@devographics/types'
import { Heard } from '../views/Heard'
import { Used } from '../views/Used'
import { CardinalitiesViewDefinition } from '../types'

export const viewDefinitions: { [key: string]: CardinalitiesViewDefinition } = {
    [FeaturesOptions.HEARD]: Heard,
    [FeaturesOptions.USED]: Used
}

export const getViewComponent = (view: string) => {
    return getViewDefinition(view).component
}

export const getViewDefinition = (view: string) => {
    const viewDefinition = viewDefinitions[view]
    if (!viewDefinition) {
        throw new Error(
            `cardinalities/getViewDefinition: could not find view definition for view ${view}`
        )
    }
    return viewDefinition
}
