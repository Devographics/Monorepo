import React, { useState } from 'react'
import styled from 'styled-components'
import Table from '../../charts/table/Table'
import ModalTrigger from 'core/components/ModalTrigger'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import camelCase from 'lodash/camelCase'
import BlockFooter from 'core/blocks/block/BlockFooter'
import get from 'lodash/get'

const BlockData = props => {
    return (
        <>
            <ExportWrapper>
                <ModalTrigger
                    trigger={
                        <ExportButton className="ExportButton" size="small">
                            <T k="export.export_json" />
                            {/* <ExportIcon /> */}
                        </ExportButton>
                    }
                >
                    <JSONExport {...props} />
                </ModalTrigger>

                <ModalTrigger
                    trigger={
                        <ExportButton className="ExportButton" size="small">
                            <T k="export.export_graphql" />
                            {/* <ExportIcon /> */}
                        </ExportButton>
                    }
                >
                    <GraphQLExport {...props} />
                </ModalTrigger>
            </ExportWrapper>
            <Table {...props} />
        </>
    )
}

const JSONExport = ({ block, data }) => {
    const isArray = Array.isArray(data)

    // try to remove entities data
    const cleanedData = isArray
        ? data.map(row => {
              const { entity, ...rest } = row
              return rest
          })
        : data

    const jsonExport = JSON.stringify(cleanedData, '', 2)

    return (
        <div>
            <AutoSelectText value={jsonExport} block={block} />
        </div>
    )
}

export const getGraphQLQuery = block => {
    const { id, query } = block
    // remove first and last lines of query to remove "surveyApi" field
    const trimmedQuery = query && query.split('\n').slice(1, -2).join('\n')
    const graphQLExport = `query ${camelCase(id)}Query {
${trimmedQuery}
}`
    return graphQLExport
}

export const GraphQLExport = ({ block }) => {
    return (
        <div>
            <AutoSelectText value={getGraphQLQuery(block)} />
            <Message>
                <T k={'export.graphql'} html={true} />
            </Message>
        </div>
    )
}

const ExportWrapper = styled.div`
    margin-bottom: ${spacing(0.5)};
    display: flex;
    flex-wrap: wrap;
    gap: ${spacing(0.5)};
`

const ExportButton = styled(Button)`
    display: inline;
    margin: 0;
`

export const AutoSelectText = ({ value }) => {
    const text = React.createRef()
    const handleClick = () => {
        text.current.select()
    }
    return <TextArea value={value} readOnly ref={text} onClick={handleClick} />
}

export const Message = styled.div`
    margin-top: ${spacing(0.5)};
    font-size: ${fontSize('small')};
`

export const TextArea = styled.textarea`
    width: 100%;
    font-size: ${fontSize('small')};
    padding: ${spacing(0.5)};
    border: 0;
    border-radius: 2px;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};

    &:focus {
        outline: 0;
    }

    @media ${mq.small} {
        height: 150px;
    }
    @media ${mq.mediumLarge} {
        height: ${({ size }) => (size === 's' ? '150px' : '400px')};
    }
`

export default BlockData
