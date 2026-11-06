import './Item.scss'

import React, { ReactNode } from 'react'
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
import { PeopleIcon, PeopleModal } from './People'
import { services } from './services'
import { FeatureModal } from './Feature'
import { LibraryModal } from './Library'
import { ExternalLinkIcon, FeatureIcon, LibraryIcon } from '@devographics/icons'
import Tooltip from 'core/components/Tooltip'
import { usePageContext } from 'core/helpers/pageContext'
import { BaselineIcon } from './BaselineIcon'

export const entityComponents = {
    [EntityType.DEFAULT]: { icon: FeatureIcon, modal: PeopleModal },
    [EntityType.PEOPLE]: { icon: PeopleIcon, modal: PeopleModal },
    [EntityType.FEATURE]: { icon: FeatureIcon, modal: FeatureModal },
    [EntityType.LIBRARY]: { icon: LibraryIcon, modal: LibraryModal }
}

const chipTriggerFields = ['example']
const entityHasData = (entity: Entity) =>
    [
        ...chipTriggerFields,
        ...services.filter(s => s.service !== 'homepage').map(s => s.service)
    ].some(property => !!entity[property as keyof Entity])

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

    const className = getItemClassName({ entity })

    if (!entity) {
        return (
            <Wrapper type="noEntity" className={className}>
                <Label label={labelObject} id={id} />
            </Wrapper>
        )
    } else if (
        !enableItemPopovers ||
        !entityHasData(entity) ||
        !entityComponents[entity.entityType]
    ) {
        const linkUrl = entity?.homepage?.url
        if (linkUrl) {
            return (
                <Wrapper type="default" className={className}>
                    <Label label={labelObject} href={linkUrl} id={id} />
                </Wrapper>
            )
        } else {
            return (
                <Wrapper type="default" className={className}>
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

const getItemClassName = ({ entity }: { entity?: Entity }) => {
    let items: string[] = []
    if (entity?.tags) {
        items = [...items, ...entity.tags]
    }
    return items.map(item => `chart-item-${item}`).join(' ')
}

const Wrapper = ({
    children,
    type,
    className
}: {
    children: ReactNode
    type: string
    className?: string
}) => <span className={`chart-item chart-item-${type} ${className}`}>{children}</span>

// scroll speed for truncated labels, in pixels per second
const MARQUEE_SPEED = 70

// on hover, if the label is truncated, store how far it overflows
// so the CSS animation can scroll it at a constant speed
const startMarquee = (e: React.MouseEvent<HTMLSpanElement>) => {
    const wrapper = e.currentTarget
    const label = wrapper.firstElementChild as HTMLElement | null
    if (!label) {
        return
    }
    const overflow = label.scrollWidth - wrapper.clientWidth
    if (overflow > 1) {
        wrapper.style.setProperty('--marquee-distance', `${overflow}px`)
        wrapper.style.setProperty('--marquee-duration', `${overflow / MARQUEE_SPEED}s`)
        wrapper.classList.add('chart-item-label-wrapper-marquee')
    }
}

const stopMarquee = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.currentTarget.classList.remove('chart-item-label-wrapper-marquee')
}

const Label = ({ label: label_, href, id }: { label: LabelObject; href?: string; id: string }) => {
    const { label, description, shortLabel, key } = label_
    const longLabel = label !== shortLabel ? label : null
    const tooltipContents = description || longLabel
    const LabelElement = href ? 'a' : 'span'
    const labelComponent = (
        <span
            className="chart-item-label-wrapper"
            onMouseEnter={startMarquee}
            onMouseLeave={stopMarquee}
        >
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
