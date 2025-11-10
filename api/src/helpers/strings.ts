import sanitizeHtml from 'sanitize-html'
import { decode } from 'html-entities'
import marked from 'marked'

export const parseHtmlString = (s: string) => {
    /*

    Note: when parsing a message such as "the <strong> tag is **great**!", 
    we don't want the first <strong> to be treated as an actual HTML tag, 
    so we escape it first here. 

    */
    const escapedString = s.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    return marked.parse(escapedString)
}

export const sanitizeHtmlString = (s: string) =>
    sanitizeHtml(s, {
        disallowedTagsMode: 'discard',
        allowedClasses: {
            '*': ['*']
        },
        allowedAttributes: {
            '*': ['aria-hidden', 'href', 'name', 'target']
        }
    })

/*
    
    Input: HTML string such as <code>&lt;svg&gt;</code>
    
    0. original md string: `<svg>` was converted to HTML to remove md formatting
    
    1. first sanitize input to remove <code> </code>
    
    2. then transform &lt;svg&gt; to <svg>
    
*/
export const cleanHtmlString = (s: string) =>
    decode(
        sanitizeHtml(s, {
            allowedTags: []
        })
    )
