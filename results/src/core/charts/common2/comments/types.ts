import {
    FeaturesOptions,
    QuestionMetadata,
    SimplifiedSentimentOptions,
    WordCount,
    Comment
} from '@devographics/types'
import { FreeformAnswersState } from '../freeform_answers/types'
import { BlockVariantDefinition } from 'core/types'

export interface CommentsFiltersState extends FreeformAnswersState {
    experienceFilter: FeaturesOptions | null
    setExperienceFilter: React.Dispatch<React.SetStateAction<FeaturesOptions | null>>
    sentimentFilter: SimplifiedSentimentOptions | null
    setSentimentFilter: React.Dispatch<React.SetStateAction<SimplifiedSentimentOptions | null>>
    valueFilter: string | number | null
    setValueFilter: React.Dispatch<React.SetStateAction<string | number | null>>
}

export interface CommentsCommonProps {
    block: BlockVariantDefinition
    question: QuestionMetadata
}
export interface CommentsData {
    comments: Comment[]
    stats: WordCount[]
}
