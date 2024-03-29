import React from 'react'
import Block from 'core/blocks/block/BlockVariant'
import get from 'lodash/get'
import BlockDebug from 'core/blocks/block/BlockDebug'
import { BlockDefinition } from 'core/types'

export const BlockError = ({
    message,
    data,
    block,
    children
}: {
    message?: React.ReactNode
    block: BlockDefinition
    children: React.ReactNode
    data: any
}) => (
    <Block block={block}>
        <h3 className="block">{block.id}</h3>
        <div className="error">{message}</div>
        <BlockDebug block={block} data={data} />
        {children}
    </Block>
)

export class ErrorBoundary extends React.Component<{ block: BlockDefinition; pageData: any }> {
    state: any = {}
    static getDerivedStateFromError(error) {
        return { error }
    }
    render() {
        const { block, pageData } = this.props
        const { error } = this.state
        if (error) {
            return (
                <BlockError
                    block={block}
                    message={error.message}
                    data={get(pageData, block.dataPath)}
                />
            )
        }
        return this.props.children
    }
}

export default ErrorBoundary
