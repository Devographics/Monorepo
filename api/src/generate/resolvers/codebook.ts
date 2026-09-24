import { Entity } from '@devographics/types'
import intersection from 'lodash/intersection.js'
import uniqBy from 'lodash/uniqBy.js'
import { getEntities } from '../../load/entities'
import { SurveyApiObject, EditionApiObject, ResolverType } from '../../types'
import { getEditionById } from '../helpers'

export const getEditionCodebookResolver =
    ({ survey, edition }: { survey: SurveyApiObject; edition: EditionApiObject }): ResolverType =>
    async (parent, args, context, info) => {
        console.log(`// edition codebook resolver: ${edition.id}`)
        const allEntities = await getEntities({ includeNormalizationEntities: true })

        const freshEdition = await getEditionById(edition.id)
        let entities: Entity[] = []
        for (const section of freshEdition.sections) {
            if (section.questions) {
                for (const question of section.questions) {
                    const matchTags = [...(question?.matchTags || []), question.id]
                    const questionEntities = allEntities.filter(
                        e => intersection(e.tags, matchTags).length > 0
                    )
                    entities = [...entities, ...questionEntities]
                }
            }
        }
        entities = uniqBy(entities, e => e.id)
        return { entities, entitiesCount: entities.length }
    }
