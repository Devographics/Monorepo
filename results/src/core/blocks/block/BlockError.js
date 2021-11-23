import React from 'react'
import Block from 'core/blocks/block/Block'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'

export const BlockError = ({ message, data, block, children }) => (
  <Block block={block}>
      <div className="error">{message}</div>
      {data && !isEmpty(data) && (
          <pre className="error error-data">
              <code>{JSON.stringify(data, '', 2)}</code>
          </pre>
      )}
      {children}
  </Block>
)

export class ErrorBoundary extends React.Component {
  state = {}
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