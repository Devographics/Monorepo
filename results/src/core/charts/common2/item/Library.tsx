import React from 'react'
import Avatar from 'core/components/Avatar'
import { UserIcon } from 'core/icons'
import { LabelProps } from './types'

export const LibraryIcon = ({ entity }: LabelProps) =>
    entity?.avatar?.url ? <Avatar entity={entity} size={30} /> : <UserIcon />

export const LibraryModal = ({ entity }: LabelProps) => <div>*links go here*</div>
