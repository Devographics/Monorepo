import './Item.scss'

import React, { ReactNode, useContext } from 'react'
import { useI18n } from '@devographics/react-i18n'
import { LabelObject, getItemLabel } from 'core/helpers/labels'
import {
    Bucket,
    Entity,
    EntityType,
    FacetBucket,
    ResponseEditionMetadata
} from '@devographics/types'
import Button from 'core/components/Button'
// import Popover from 'core/components/Popover'
import Popover from 'core/components/Popover2'
import { PeopleIcon, PeopleModal, services } from './People'
import { baselineStatuses, FeatureModal } from './Feature'
import { LibraryModal } from './Library'
import { ExternalLinkIcon, FeatureIcon, LibraryIcon } from '@devographics/icons'
import Tooltip from 'core/components/Tooltip'
import { usePageContext } from 'core/helpers/pageContext'
import T from 'core/i18n/T'
import { SeriesMetadata } from '../types'
import { BaselineIcon } from './BaselineIcon'

export const entityComponents = {
    [EntityType.DEFAULT]: { icon: FeatureIcon, modal: FeatureModal },
    [EntityType.PEOPLE]: { icon: PeopleIcon, modal: PeopleModal },
    [EntityType.FEATURE]: { icon: FeatureIcon, modal: FeatureModal },
    [EntityType.LIBRARY]: { icon: LibraryIcon, modal: LibraryModal }
}

const chipTriggerFields = ['example']
const entityHasData = (entity: Entity) =>
    [...chipTriggerFields, ...services.map(s => s.service)].some(
        property => !!entity[property as keyof Entity]
    )

export const ChartItem = ({
    id,
    bucket,
    label: providedLabel,
    entity,
    i18nNamespace,
    serieMetadata
}: {
    id: string
    label?: string
    bucket: Bucket | FacetBucket
    entity?: Entity
    i18nNamespace?: string
    serieMetadata?: ResponseEditionMetadata
}) => {
    const { config } = usePageContext()
    const { enableItemPopovers = true } = config

    const { getString } = useI18n()
    const labelObject = getItemLabel({
        id,
        label: providedLabel,
        entity,
        getString,
        i18nNamespace,
        html: true,
        values: serieMetadata
    })

    if (!entity) {
        return (
            <Wrapper type="noEntity">
                <Label label={labelObject} id={id} />
            </Wrapper>
        )
    } else if (
        !enableItemPopovers ||
        entity.entityType === EntityType.DEFAULT ||
        !entityHasData(entity) ||
        !entityComponents[entity.entityType]
    ) {
        const linkUrl = entity?.homepage?.url
        if (linkUrl) {
            return (
                <Wrapper type="default">
                    <Label label={labelObject} href={linkUrl} id={id} />
                </Wrapper>
            )
        } else {
            return (
                <Wrapper type="default">
                    <Label label={labelObject} id={id} />
                </Wrapper>
            )
        }
    } else {
        const { icon: IconComponent, modal: ModalComponent } = entityComponents[entity.entityType]

        return (
            <Popover
                trigger={
                    <Button
                        className={`button-round chart-item chart-item-entity chart-item-${entity.entityType}`}
                    >
                        {entity.entityType === EntityType.PEOPLE && (
                            <IconComponent entity={entity} size="petite" />
                        )}
                        <Label label={labelObject} id={id} />
                        <BaselineIcon status={entity?.webFeature?.status?.baseline} />
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

const Label = ({ label: label_, href, id }: { label: LabelObject; href?: string; id: string }) => {
    const { label, description, shortLabel, key } = label_
    const longLabel = label !== shortLabel ? label : null
    const tooltipContents = description || longLabel
    const LabelElement = href ? 'a' : 'span'
    const labelComponent = (
        <span className="chart-item-label-wrapper">
            <LabelElement
                data-key={key}
                data-id={id}
                className={`chart-item-label ${tooltipContents ? 'withTooltip' : ''}`}
                {...(href
                    ? {
                          href,
                          target: '_blank',
                          onClick: e => {
                              e.stopPropagation()
                          }
                      }
                    : {})}
            >
                <span dangerouslySetInnerHTML={{ __html: shortLabel }} />
                {href && <ExternalLinkIcon />}
            </LabelElement>
        </span>
    )
    return tooltipContents ? (
        <Tooltip
            trigger={labelComponent}
            contents={<div dangerouslySetInnerHTML={{ __html: tooltipContents }} />}
        />
    ) : (
        labelComponent
    )
}
