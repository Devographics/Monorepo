import React from 'react'

export const CorrelationSubheading = ({
    questionName,
    optionLabel,
    index
}: {
    questionName: string
    optionLabel?: string
    index: number
}) => {
    return (
        <div className="correlation-item-subheading">
            <h4 className="correlation-item-breadcrumbs">
                <span>
                    <span className="correlation-item-index">{index + 1}.</span> {questionName}
                </span>

                {optionLabel && (
                    <>
                        {' '}
                        &gt; <span>{optionLabel}</span>
                    </>
                )}
            </h4>
        </div>
    )
}
