import React from 'react'
import Avatar from 'core/components/Avatar'
import { UserIcon } from 'core/icons'
import { LabelProps } from './types'

export const FeatureIcon = ({ entity }: LabelProps) =>
    entity?.avatar?.url ? <Avatar entity={entity} size={30} /> : <UserIcon />

export const FeatureModal = ({ entity }: LabelProps) => <div>*code example goes here*</div>
