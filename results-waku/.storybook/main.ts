import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/react-vite'
import { resultsWakuViteConfig } from '../vite.shared.ts'

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-a11y'],
    framework: {
        name: '@storybook/react-vite',
        options: {}
    },
    docs: {
        autodocs: 'tag'
    },
    async viteFinal(config) {
        return mergeConfig(config, resultsWakuViteConfig())
    }
}

export default config
