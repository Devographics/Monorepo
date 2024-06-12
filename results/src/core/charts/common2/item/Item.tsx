import './Item.scss'

import React, { ReactNode } from 'react'
import { useI18n } from '@devographics/react-i18n'
import { LabelObject, getItemLabel } from 'core/helpers/labels'
import { Bucket, Entity, EntityType, FacetBucket } from '@devographics/types'
import Button from 'core/components/Button'
// import Popover from 'core/components/Popover'
import Popover from 'core/components/Popover2'
import { PeopleIcon, PeopleModal, services } from './People'
import { FeatureModal } from './Feature'
import { LibraryModal } from './Library'
import { FeatureIcon, LibraryIcon } from 'core/icons'
import Tooltip from 'core/components/Tooltip'

const entityComponents = {
    [EntityType.PEOPLE]: { icon: PeopleIcon, modal: PeopleModal },
    [EntityType.FEATURE]: { icon: FeatureIcon, modal: FeatureModal },
    [EntityType.LIBRARY]: { icon: LibraryIcon, modal: LibraryModal }
}

const entityHasData = (entity: Entity) =>
    ['description', 'example', ...services.map(s => s.service)].some(
        property => !!entity[property as keyof Entity]
    )

export const Item = ({
    id,
    bucket,
    label: providedLabel,
    entity,
    i18nNamespace
}: {
    id: string
    label?: string
    bucket: Bucket | FacetBucket
    entity?: Entity
    i18nNamespace?: string
}) => {
    const { getString } = useI18n()
    const labelObject = getItemLabel({
        id,
        label: providedLabel,
        entity,
        getString,
        i18nNamespace,
        html: true
    })
    if (!entity) {
        return (
            <Wrapper type="noEntity">
                <Label label={labelObject} />
            </Wrapper>
        )
    } else if (
        entity.entityType === EntityType.DEFAULT ||
        !entityHasData(entity) ||
        !entityComponents[entity.entityType]
    ) {
        const linkUrl = entity?.homepage?.url
        if (linkUrl) {
            return (
                <Wrapper type="default">
                    <Label label={labelObject} href={linkUrl} />
                </Wrapper>
            )
        } else {
            return (
                <Wrapper type="default">
                    <Label label={labelObject} />
                </Wrapper>
            )
        }
    } else {
        const { icon: IconComponent, modal: ModalComponent } = entityComponents[entity.entityType]

        return (
            <Popover
                trigger={
                    <Button
                        className={`chart-item chart-item-entity chart-item-${entity.entityType}`}
                    >
                        <IconComponent entity={entity} size="petite" />
                        <Label label={labelObject} />
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
    const { label, description, shortLabel, key } = label_
    const LabelElement = href ? 'a' : 'span'
    const labelComponent = (
        <LabelElement
            data-key={key}
            className={`chart-item-label ${description ? 'withTooltip' : ''}`}
            {...(href ? { href } : {})}
            dangerouslySetInnerHTML={{ __html: shortLabel }}
        />
    )
    return description ? (
        <Tooltip
            trigger={labelComponent}
            contents={<div dangerouslySetInnerHTML={{ __html: description }} />}
        />
    ) : (
        labelComponent
    )
}
