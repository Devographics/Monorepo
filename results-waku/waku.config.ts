import type { Config } from 'waku/config'
import { resultsWakuViteConfig } from './vite.shared.ts'

export default {
    vite: resultsWakuViteConfig()
} satisfies Config
