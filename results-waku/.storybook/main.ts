import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/react-vite'

const storybookDir = dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    addons: [
        '@storybook/addon-essentials',
        '@storybook/addon-a11y',
        '@storybook/addon-interactions'
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {}
    },
    viteFinal: async config =>
        mergeConfig(config, {
            resolve: {
                alias: {
                    '@': resolve(storybookDir, '../src')
                }
            }
        })
}

export default config
