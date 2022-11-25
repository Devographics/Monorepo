import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import ModalTrigger from 'core/components/ModalTrigger'
import T from 'core/i18n/T'
import { secondaryFontMixin, mq, spacing, fontSize } from 'core/theme'
import { CommentIcon } from 'core/icons'
import { runQuery } from 'core/blocks/explorer/data'
import config from 'Config/config.yml'

type GetQueryProps = {
    id: string
    slug: string
    year: number
    field: string
}

const getQuery = ({ id, slug, year, field }: GetQueryProps) => `
query ${id}CommentsQuery {
  survey(survey: ${slug}) {
    ${field}(id: ${id}) {
      comments {
        year(year: ${year}) {
          comments_raw {
            message
            responseId
          }
        }
      }
    }
  }
}
`

const getField = (blockType: string) => {
    switch (blockType) {
        case 'FeatureExperienceBlock':
            return 'feature'
        case 'ToolExperienceBlock':
            return 'tool'
        default:
            throw new Error(`Cannot get comments for block type "${blockType}"`)
    }
}

const CommentsWrapper = props => {
    const [data, setData] = useState()
    const [isLoading, setIsLoading] = useState(false)

    const { block, name } = props
    const { id, blockType } = block
    const { slug, year } = config
    const field = getField(blockType)

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true)
            const query = getQuery({ id, slug, year, field })
            const url = process.env.GATSBY_DATA_API_URL
            if (!url) {
                throw new Error('GATSBY_DATA_API_URL env variable is not set')
            }
            const result = await runQuery(url, query, `${id}CommentsQuery`)
            const comments = result?.survey?.[field]?.comments?.year?.comments_raw
            setData(comments)
            setIsLoading(false)
        }

        getData()
    }, [])

    return (
        <div>
            <h2>
                <T k="comments.comments_for" values={{ name }} />
            </h2>
            <p>
                <T k="comments.description" />
            </p>
            <div>{isLoading ? <div>Loading…</div> : <Comments comments={data} />}</div>
        </div>
    )
}

const Comments = ({ comments }) => {
    return (
        <div>
            {comments?.map((comment, i) => (
                <Comment key={i} {...comment} />
            ))}
        </div>
    )
}

const Comment = ({ message, responseId }) => {
    return (
        <CommentItem>
            <CommentMessageWrapper>
                <CommentQuote>“</CommentQuote>
                <CommentMessage>{message}</CommentMessage>
            </CommentMessageWrapper>
            <CommentReportLink href="#">
                <T k="comments.report_abuse" />
            </CommentReportLink>
        </CommentItem>
    )
}

const CommentsTrigger = props => (
    <ModalTrigger
        trigger={
            <span>
                <CommentIcon enableTooltip={true} labelId="comments.comments" />
                <CommentCount>{props?.originalData?.comments?.year?.count}</CommentCount>
            </span>
        }
    >
        <CommentsWrapper
            {...props}
            name={props?.originalData?.entity?.nameClean || props?.originalData?.entity?.name}
        />
    </ModalTrigger>
)

const CommentCount = styled.span`
    display: block;
    position: absolute;
    top: 3px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.6rem;
    font-weight: bold;
`

const CommentItem = styled.div`
    margin-bottom: ${spacing()};
`

const CommentMessageWrapper = styled.div`
    border-radius: 3px;
    background: ${({ theme }) => theme.colors.backgroundAlt2};
    padding: ${spacing()};
    position: relative;
`

const CommentQuote = styled.div`
    font-size: 6rem;
    position: absolute;
    top: 0px;
    left: 5px;
    line-height: 1;
    opacity: 0.1;
    ${secondaryFontMixin}
`

const CommentMessage = styled.div`
`

const CommentReportLink = styled.a`
    font-size: 0.6rem;
    margin-top: 3px;
    text-align: right;
    display: block;
`

export default CommentsTrigger
