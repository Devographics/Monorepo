import { allMatrixDimensionIds, MatrixDimensionId } from 'core/survey_api/matrices'

export type DimensionId = Exclude<MatrixDimensionId, 'source'>

export const allDimensionIds = allMatrixDimensionIds.filter(
    (dimension) => !['source'].includes(dimension)
) as DimensionId[]
