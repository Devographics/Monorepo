import './Item.scss'

import React, { ReactNode } from 'react'
import { useI18n } from '@devographics/react-i18n'
import { LabelObject, getItemLabel } from 'core/helpers/labels'
import { Bucket, Entity, EntityType } from '@devographics/types'
import Button from 'core/components/Button'
// import Popover from 'core/components/Popover'
import Popover from 'core/components/Popover2'
import { PeopleIcon, PeopleModal } from './People'
import { FeatureModal } from './Feature'
import { LibraryModal } from './Library'
import { FeatureIcon, LibraryIcon } from 'core/icons'
import Tooltip from 'core/components/Tooltip'

const entityComponents = {
    [EntityType.PEOPLE]: { icon: PeopleIcon, modal: PeopleModal },
    [EntityType.FEATURE]: { icon: FeatureIcon, modal: FeatureModal },
    [EntityType.LIBRARY]: { icon: LibraryIcon, modal: LibraryModal }
}

export const Item = ({
    id,
    bucket,
    label: providedLabel,
    entity,
    i18nNamespace
}: {
    id: string
    label?: string
    bucket: Bucket
    entity?: Entity
    i18nNamespace: string
}) => {
    const { getString } = useI18n()
    const label = getItemLabel({
        id,
        label: providedLabel,
        entity,
        getString,
        i18nNamespace
    })
    if (!entity) {
        return (
            <Wrapper type="noEntity">
                <Label label={label} />
            </Wrapper>
        )
    } else if (entity.type === EntityType.DEFAULT) {
        const linkUrl = entity?.homepage?.url
        if (linkUrl) {
            return (
                <Wrapper type="default">
                    <Label label={label} href={linkUrl} />
                </Wrapper>
            )
        } else {
            return (
                <Wrapper type="default">
                    <Label label={label} />
                </Wrapper>
            )
        }
    } else {
        const { icon: IconComponent, modal: ModalComponent } = entityComponents[entity.type]

        return (
            <Popover
                trigger={
                    <Button className={`chart-item chart-item-${entity.type}`}>
                        <IconComponent entity={entity} size="petite" />
                        <Label label={label} />
                    </Button>
                }
            >
                <div className="item-modal">
                    <ModalComponent entity={entity} />
                </div>
            </Popover>
        )
    }
}

const Wrapper = ({ children, type }: { children: ReactNode; type: string }) => (
    <span className={`chart-item chart-item-${type}`}>{children}</span>
)

const Label = ({ label: label_, href }: { label: LabelObject; href?: string }) => {
    const { label, shortLabel } = label_
    const LabelComponent = href ? 'a' : 'span'
    return (
        <Tooltip
            trigger={
                <LabelComponent className="chart-item-label" {...(href ? { href } : {})}>
                    {shortLabel}
                </LabelComponent>
            }
            contents={<div>{label}</div>}
        />
    )
}
