import { useI18n } from '@devographics/react-i18n'
import Help from 'core/components/Help'
import { getBlockTitle } from 'core/helpers/blockHelpers'
import { getOptionsNamespace, getItemLabel } from 'core/helpers/labels'
import { usePageContext } from 'core/helpers/pageContext'
import T from 'core/i18n/T'
import React, { useCallback, useState } from 'react'
import { CorrelationProps } from './types'
import { getTrendDirectionKey } from './helpers'
import { CorrelationsExclusions } from './CorrelationsExclusions'
import { getMainHeadingKey } from './helpers'
import { CorrelationsList } from './CorrelationsList'
import { CorrelationsSpectrum } from './CorrelationsSpectrum'
import { CorrelationsListHeading } from './CorrelationsListHeading'

export const CorrelationsContent = (props: CorrelationProps) => {
    const { question, block, optionId, correlations, type } = props
    const { doNotCorrelateWith } = question
    const { getString, getFallbacks } = useI18n()
    const pageContext = usePageContext()
    const i18nNamespace = getOptionsNamespace({ question, block })

    const count = correlations.length

    const { tClean: questionLabel } = getBlockTitle({ block, pageContext, getFallbacks })

    // for shape2 and shape3
    let optionLabel
    if (optionId) {
        const optionLabelObject = getItemLabel({
            id: optionId,
            getString,
            i18nNamespace
        })
        optionLabel = typeof optionId !== undefined && optionLabelObject?.shortLabel
    }

    const directionKey = getTrendDirectionKey({ question, direction: 'positive', getString })
    const directionLabel = getString(directionKey)?.t

    const headingKey = getMainHeadingKey({ question, type })

    // the correlation hovered in either the spectrum or the lists
    const [activeKey, setKey] = useState<string | null>(null)
    const setActiveKey = useCallback((key: string, isActive: boolean) => {
        // only clear the key it set, so that leaving one element after entering
        // another can't wipe the newer one
        setKey(current => (isActive ? key : current === key ? null : current))
    }, [])
    const highlightProps = { activeKey, setActiveKey }

    const negativeCorrelations = correlations.filter(c => c.correlation < 0)
    const positiveCorrelations = correlations.filter(c => c.correlation > 0)
    return (
        <div className={`correlations correlations-wrapper correlation-positive`}>
            <div className="correlations-heading-wrapper">
                <div className="correlations-heading-help">
                    <Help id="correlations" />
                </div>
                <div className="correlations-heading-wrapper2">
                    <div className="correlations-heading-wrapper3">
                        <h3 className="correlations-heading">
                            <T
                                k={headingKey}
                                values={{ count, directionLabel, questionLabel, optionLabel }}
                                md={true}
                            />
                        </h3>
                        <CorrelationsExclusions question={question} block={block} />
                    </div>
                </div>
                <div className="correlations-content">
                    {/* <CorrelationsDirections /> */}

                    {/* <div className="correlation-lists-headings">
                        <CorrelationsListHeading direction={'negative'} />
                        <div className="correlation-lists-separator" />
                        <CorrelationsListHeading direction={'positive'} />
                    </div> */}

                    <CorrelationsSpectrum {...props} {...highlightProps} />

                    <div className="correlation-lists">
                        <CorrelationsList
                            {...props}
                            {...highlightProps}
                            correlations={negativeCorrelations}
                            direction="negative"
                        />
                        <div className="correlation-lists-separator" />
                        <CorrelationsList
                            {...props}
                            {...highlightProps}
                            correlations={positiveCorrelations}
                            direction="positive"
                        />
                    </div>
                    <div className="correlations-note">
                        <T k="correlations.note" md={true} html={true} />
                    </div>
                </div>
            </div>
        </div>
    )
}
