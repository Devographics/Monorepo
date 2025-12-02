import { Entity } from '@devographics/types'
import { IconProps } from '@devographics/icons'

export type LabelProps = {
    entity: Entity
}

export type ServiceDefinition = {
    service: string
    icon: (props: IconProps) => JSX.Element
}
