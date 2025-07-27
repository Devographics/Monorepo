import React from 'react'
import { LabelProps } from './types'
import CodeExample from 'core/components/CodeExample'
import { ItemLinks } from './People'
import { Entity, WebFeature, WebFeatureSupport } from '@devographics/types'
import './Feature.scss'
import T from 'core/i18n/T'
import {
    CheckIcon,
    CloseIcon,
    ChromeIcon,
    EdgeIcon,
    FirefoxIcon,
    SafariIcon,
    LimitedAvailability,
    NewlyAvailable,
    WidelyAvailable
} from '@devographics/icons'
import { BaselineIcon } from './BaselineIcon'

export const browsers: Array<{ id: keyof WebFeatureSupport; icon: React.ReactNode }> = [
    { id: 'chrome', icon: ChromeIcon },
    { id: 'edge', icon: EdgeIcon },
    { id: 'firefox', icon: FirefoxIcon },
    { id: 'safari', icon: SafariIcon }
]

export const baselineStatuses = {
    high: { icon: WidelyAvailable, id: 'widely_available' },
    low: { icon: NewlyAvailable, id: 'newly_available' },
    false: { icon: LimitedAvailability, id: 'limited_availability' }
}

export const FeatureModal = ({ entity }: LabelProps) => (
    <div>
        <h3
            className="item-name"
            dangerouslySetInnerHTML={{ __html: entity.nameHtml || entity.nameClean || '' }}
        />
        {entity.description && (
            <div
                className="item-description"
                dangerouslySetInnerHTML={{ __html: entity.descriptionHtml || entity.description }}
            />
        )}
        {entity.example && (
            <CodeExample code={entity.example.code} language={entity.example.language} />
        )}
        <ItemLinks entity={entity} />
        {entity.resources && <ResourceLinks resources={entity.resources} />}

        {entity.webFeature && (
            <>
                <WebFeatureData entity={entity} />
                {/* <baseline-status featureId={entity.webFeature.id}></baseline-status>
                <pre>
                    <code>{JSON.stringify(entity.webFeature, null, 2)}</code>
                </pre> */}
            </>
        )}
    </div>
)

const WebFeatureData = ({ entity }: { entity: Entity }) => {
    const { webFeature } = entity
    if (!webFeature) {
        return null
    }
    return (
        <div className="baseline-data">
            <h4>
                <T k="baseline.baseline" />{' '}
                <span
                    className={`baseline-indicator-text baseline-indicator-text-${webFeature.status.baseline}`}
                >
                    <T k={`baseline.support.${webFeature.status.baseline}`} />
                </span>
                {/* <BaselineIcon status={webFeature.status.baseline} /> */}
            </h4>
            <div className="baseline-support">
                {browsers.map(({ id, icon }) => (
                    <Browser
                        key={id}
                        id={id}
                        icon={icon}
                        support={webFeature?.status?.support?.[id]}
                    />
                ))}
            </div>
            <a href={webFeature?.url}>
                <T k="baseline.learn_more" />
            </a>
        </div>
    )
}

const Browser = ({
    id,
    icon,
    support
}: {
    id: string
    icon: React.ReactNode
    support: string | null
}) => {
    const Icon = icon
    const supportClass = support ? 'enabled' : 'disabled'
    return (
        <div className={`baseline-support-icon baseline-support-icon-${supportClass}`}>
            <Icon className="baseline-support-browser" />
            {support ? (
                <CheckIcon className="baseline-support-check" />
            ) : (
                <CloseIcon className="baseline-support-close" />
            )}
        </div>
    )
}

const ResourceLinks = ({ resources }: { resources: Entity['resources'] }) => {
    return (
        <ul className="item-resources">
            {resources?.map(({ url, title }) => (
                <li key={title}>
                    <a href={url}>{title}</a>
                </li>
            ))}
        </ul>
    )
}
