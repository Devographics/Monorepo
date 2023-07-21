import { EditionMetadata, SurveyMetadata } from '@devographics/types'
import { any } from 'prop-types'
import { Locale } from './i18n'

export interface PageDef {
    path: string,

}
export interface PageContextValue {
    id: string
    locale?: Locale
    width?: number
    isCapturing?: boolean
    chartSponsors?: any
    config?: any
    currentSurvey: SurveyMetadata
    currentEdition: EditionMetadata
    pageData: any,
    //
    currentPath: string,
    path: string,
    basePath: string,
    host: string,
    titleId: string,
    intlId: string,
    //
    block: any
}
