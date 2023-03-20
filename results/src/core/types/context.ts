import { EditionMetadata, SurveyMetadata } from '@devographics/types'
import { Locale } from './i18n'

export interface PageContextValue {
    locale?: Locale
    width?: number
    isCapturing?: boolean
    chartSponsors?: any
    config?: any
    currentSurvey: SurveyMetadata
    currentEdition: EditionMetadata
}
