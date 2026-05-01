import React from 'react'
import './CodeExample.scss'

const CodeExample = ({ language, code }: { language?: string; code: string }) => (
    <div className="code-example">
        {language && <h4 className="code-example-language">{language}</h4>}
        <pre className="code-example-pre">
            <code className="code-example-code">{code}</code>
        </pre>
    </div>
)

export default CodeExample
