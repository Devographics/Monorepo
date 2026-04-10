import type { Meta, StoryObj } from '@storybook/react-vite'
import { SitemapPage } from '../templates/sitemap-page'

const meta = {
    title: 'Templates/SitemapPage',
    component: SitemapPage,
    tags: ['autodocs'],
    args: {
        locale: 'en-US',
        surveyId: 'state_of_js',
        editionId: 'js2025',
        pageId: 'homepage',
        path: '/en-US/',
        blocks: [
            {
                id: 'introduction',
                blockType: 'text'
            },
            {
                id: 'features',
                blockType: 'chart',
                template: 'bar_chart'
            }
        ]
    }
} satisfies Meta<typeof SitemapPage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
