import React from 'react'
import T from 'core/i18n/T'

export const CommentsItemWrapper = ({
    index,
    contents,
    answer,
    reportLink
}: {
    index: number
    contents: string
    answer: JSX.Element | null
    reportLink: string
}) => {
    return (
        <div className="comment-item-wrapper">
            <div className="comment-index">{index + 1}.</div>
            <div className="comment-item">
                <div className="comment-message-wrapper inverted">
                    <div className="comment-quote">“</div>
                    <div
                        className="comment-message"
                        dangerouslySetInnerHTML={{ __html: contents }}
                    />
                    {/* <CommentsLikes /> */}
                </div>
                <div className="comment-footer">
                    <div className="comment-response-wrapper">
                        <div className="comment-response">{answer}</div>
                    </div>
                    <a className="comment-report-link" href={reportLink}>
                        <T k="comments.report_abuse" />
                    </a>
                </div>
            </div>
        </div>
    )
}
