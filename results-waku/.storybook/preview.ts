import type { Preview } from '@storybook/react'

const preview: Preview = {
    parameters: {
        layout: 'fullscreen',
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            }
        },
        a11y: {
            test: 'todo'
        }
    }
}

export default preview
