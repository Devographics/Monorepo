import type { Meta, StoryObj } from '@storybook/react-vite'
import { Main } from '../main'

const meta = {
    title: 'Shell/Main',
    component: Main,
    tags: ['autodocs'],
    args: {
        children: (
            <section>
                <h1>Storybook is wired up</h1>
                <p>`results-waku` components can render here.</p>
            </section>
        )
    }
} satisfies Meta<typeof Main>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
