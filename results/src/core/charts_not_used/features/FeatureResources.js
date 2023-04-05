import React, { memo } from 'react'
import { useI18n } from 'core/i18n/i18nContext'

const FeatureResources = ({ id, mdnInfo, caniuseInfo }) => {
    const { translate } = useI18n()
    if (!caniuseInfo && !mdnInfo) {
        return null
    }

    return (
        <div className="Feature__Resources FTBlock__Resources">
            <h3>{translate('feature.learn_more')}</h3>
            <ul>
                {mdnInfo && (
                    <li className="Feature__Links__Item">
                        <a href={`https://developer.mozilla.org${mdnInfo.url}`}>
                            {translate('feature.mdn_link')}
                        </a>
                    </li>
                )}

                {caniuseInfo && (
                    <>
                        {caniuseInfo.spec && (
                            <li className="Feature__Links__Item">
                                <a href={caniuseInfo.spec}>
                                    {translate('feature.specification_link')}
                                </a>
                            </li>
                        )}
                        <li className="Feature__Links__Item">
                            <a href={`https://caniuse.com/#feat=${id}`}>
                                {translate('feature.caniuse_link')}
                            </a>
                        </li>
                    </>
                )}
            </ul>
        </div>
    )
}

export default memo(FeatureResources)
