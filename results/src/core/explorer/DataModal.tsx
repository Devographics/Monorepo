import React, { useState } from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize, fontWeight } from 'core/theme'
import { useI18n } from 'core/i18n/i18nContext'
import T from 'core/i18n/T'
import { CommonProps } from './types'
import { usePageContext } from 'core/helpers/pageContext'
import { JSONExport, GraphQLExport } from 'core/blocks/block/BlockData'
import * as Tabs from '@radix-ui/react-tabs'
import { TabsList, TabsTrigger } from 'core/blocks/block/BlockTabsWrapper'

interface ShareModalProps extends CommonProps {
    closeModal?: any
}
// the modal handles its own internal state before updating the overall explorer state on submit
const DataModal = (props: ShareModalProps) => {
    const { query, data, stateStuff } = props
    const { xField, yField } = stateStuff

    return (
        <DataModal_>
            <Tabs.Root defaultValue="export_json" orientation="horizontal">
                <TabsList aria-label="tabs example">
                    <TabsTrigger value="export_json">
                        <T k="export.export_json" />
                    </TabsTrigger>
                    <TabsTrigger value="export_graphql">
                        <T k="export.export_graphql" />
                    </TabsTrigger>
                </TabsList>
                <Tab_ value="export_json">
                    <JSONExport block={{ id: `${xField}__${yField}` }} data={data} />
                </Tab_>
                <Tab_ value="export_graphql">
                    <GraphQLExport query={query} />
                </Tab_>
            </Tabs.Root>
        </DataModal_>
    )
}

const DataModal_ = styled.div``

const Tab_ = styled(Tabs.Content)`
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: ${spacing()};
    background: ${({ theme }) => theme.colors.background};
`

export default DataModal
