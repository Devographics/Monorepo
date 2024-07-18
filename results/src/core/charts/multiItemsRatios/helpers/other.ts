import { StandardQuestionData } from '@devographics/types'

export const getAllEditions = (item: StandardQuestionData) => item?.responses?.allEditions || []
