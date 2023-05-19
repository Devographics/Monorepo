import { useContext } from 'react'
import { VulcanComponentsContext } from './Context'

export const VulcanComponentsConsumer = VulcanComponentsContext.Consumer

export const useVulcanComponents = () => {
    const val = useContext(VulcanComponentsContext)
    return val
}
