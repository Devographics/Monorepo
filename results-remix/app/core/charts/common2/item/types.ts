import { Entity } from '@devographics/types'
import { IconProps } from 'core/icons/IconWrapper'

export type LabelProps = {
    entity: Entity
}

export type ServiceDefinition = {
    service: string
    icon: (props: IconProps) => JSX.Element
}
