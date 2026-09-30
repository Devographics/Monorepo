import { QuestionLabelObject } from 'core/charts/common2/helpers/labels'
import { LabelObject } from 'core/helpers/labels'
import React from 'react'

export const CorrelationSubheading = ({
    questionLabelObject,
    optionLabelObject,
    index
}: {
    questionLabelObject: QuestionLabelObject
    optionLabelObject: LabelObject
    index: number
}) => {
    const { key: questionKey, questionName } = questionLabelObject
    const optionLabel = optionLabelObject?.shortLabel
    return (
        <div className="correlation-item-subheading">
            <h4 className="correlation-item-breadcrumbs">
                <span>
                    {/* <span className="correlation-item-index">{index + 1}.</span> */}
                    <span data-key={questionKey}>{questionName}</span>
                </span>

                {optionLabel && (
                    <>
                        {' '}
                        &gt; <span data-key={optionLabelObject?.key}>{optionLabel}</span>
                    </>
                )}
            </h4>
        </div>
    )
}
