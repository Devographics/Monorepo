import React from 'react'
import { LabelProps } from './types'
import CodeExample from 'core/components/CodeExample'
import { ItemLinks } from './People'
import { Entity, WebFeature, WebFeatureSupport } from '@devographics/types'
import 'baseline-status'
import { ChromeIcon } from 'core/icons/Chrome'
import { EdgeIcon } from 'core/icons/Edge'
import { FirefoxIcon } from 'core/icons/Firefox'
import { SafariIcon } from 'core/icons/Safari'
import './Feature.scss'
import T from 'core/i18n/T'
import { CheckIcon, CloseIcon } from 'core/icons'

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
                <WebFeatureData data={entity.webFeature} />
                {/* <baseline-status featureId={entity.webFeature.id}></baseline-status>
                <pre>
                    <code>{JSON.stringify(entity.webFeature, null, 2)}</code>
                </pre> */}
            </>
        )}
    </div>
)

const browsers: Array<{ id: keyof WebFeatureSupport; icon: React.ReactNode }> = [
    { id: 'chrome', icon: ChromeIcon },
    { id: 'edge', icon: EdgeIcon },
    { id: 'firefox', icon: FirefoxIcon },
    { id: 'safari', icon: SafariIcon }
]

const WebFeatureData = ({ data }: { data: WebFeature }) => {
    return (
        <div className="baseline-data">
            <h4>
                <T k="baseline.baseline" /> <T k={`baseline.support.${data.status.baseline}`} />
            </h4>
            <div className="baseline-support">
                {browsers.map(({ id, icon }) => (
                    <Browser key={id} id={id} icon={icon} support={data?.status?.support?.[id]} />
                ))}
            </div>
            <a href="https://web-platform-dx.github.io/web-features/">
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
