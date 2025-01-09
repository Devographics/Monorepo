/**
 * TODO: cf API code that uses this a lot to generate the charts
 */

import { z } from 'zod'

export const chartParamsSchema = z.object({
    surveyId: z.string(),
    editionId: z.string(),
    localeId: z
        .string()
        .optional()
        .nullable()
        .transform(v => v ?? 'en-US'),
    // not needed anymore because we assume unique block ids
    // sectionId: z.string(),
    // subSectionId: z.string().optional().nullable(),
    blockId: z.string(),
    params: z.string().optional().nullable(),
    subSectionId: z.string().optional().nullable(),
    sectionId: z.string().optional().nullable()
})

export type ChartParams = z.infer<typeof chartParamsSchema>
