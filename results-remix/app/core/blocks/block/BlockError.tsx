import React from 'react'
import Block from 'core/blocks/block/BlockVariant'
import get from 'lodash/get'
import BlockDebug from 'core/blocks/block/BlockDebug'
import { BlockVariantDefinition } from 'core/types'

export const BlockError = ({
    message,
    data,
    block,
    errorCode,
    children
}: {
    message?: React.ReactNode
    block: BlockVariantDefinition
    children?: React.ReactNode
    errorCode?: any
    data?: any
}) => (
    <div>
        <h3 className="block">{block.id}</h3>
        <div className="error">{message}</div>
        <BlockDebug block={block} data={data} />
        {children}
        {errorCode && (
            <pre>
                <code>{JSON.stringify(errorCode, null, 2)}</code>
            </pre>
        )}
    </div>
)

export class ErrorBoundary extends React.Component<{
    block: BlockVariantDefinition
    pageData: any
}> {
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
