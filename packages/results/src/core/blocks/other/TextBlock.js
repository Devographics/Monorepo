import React from 'react'
import styled from 'styled-components'
// import ReactMarkdown from 'react-markdown'
// import rehypeRaw from 'rehype-raw'

import { spacing } from 'core/theme'

const Content = styled.div`
    li {
        margin-bottom: ${spacing(0.5)};
    }
`

const TextBlock = ({ className, text, title, children }) => {
    const cssClass = `block block--text ${className}`
    if (children) {
        return <div className={cssClass}>{children}</div>
    } else {
        return (
            <div className={cssClass}>
                {title && <h3 className="Block__Title block__title">{title}</h3>}
                {text && (
                    <Content className="block__content">
                        {/* <ReactMarkdown rehypePlugins={[rehypeRaw]}>{text}</ReactMarkdown> */}
                        {text}
                    </Content>
                )}
            </div>
        )
    }
}

export default TextBlock
