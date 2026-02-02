import {
    ALL_FEATURES_SECTION,
    FEATURES_TYPE,
    ALL_TOOLS_SECTION,
    TOOLS_TYPE
} from '@devographics/constants'
import { ApiSectionTypes, Edition, Section } from '@devographics/types'
import { getEditionItems, getSectionItems } from '../generate/helpers'
import { EditionApiObject, RequestContext, SectionApiObject, SurveyApiObject } from '../types'
import { getEntity } from '../load/entities'

export const addAutoFeatures = (edition: Edition | EditionApiObject) => {
    const featuresSections = edition?.sections?.filter(section => isFeatureSection(section)) || []
    const featuresQuestions = getEditionItems(edition, FEATURES_TYPE)
    return featuresSections.length > 0 || featuresQuestions.length > 0
}

export const addAutoLibraries = (edition: Edition | EditionApiObject) => {
    const librariesSections = edition?.sections?.filter(section => isLibrarySection(section)) || []
    const librariesQuestions = getEditionItems(edition, TOOLS_TYPE)
    return librariesSections.length > 0 || librariesQuestions.length > 0
}

export const isFeatureSection = (section: Section | SectionApiObject) =>
    section.id === 'features' || (section.template && ['featurev3'].includes(section.template))

export const isLibrarySection = (section: Section | SectionApiObject) =>
    section.id === 'libraries' ||
    (section.template && ['tool', 'toolv3'].includes(section.template)) /*

Resolver map used for section_features, section_tools

*/
// if this is the main "Features" or "Tools" section, return every item; else return
// only items for current section

export const getItems = async ({
    survey,
    edition,
    section,
    type,
    context
}: {
    survey: SurveyApiObject
    edition: EditionApiObject
    section: SectionApiObject
    type: ApiSectionTypes
    context: RequestContext
}) => {
    const items = [
        'features',
        'tools',
        'libraries',
        ALL_FEATURES_SECTION,
        ALL_TOOLS_SECTION
    ].includes(section.id)
        ? getEditionItems(edition, type)
        : getSectionItems(section, type)

    return items.map(async question => ({
        survey,
        edition,
        section,
        question,
        entity: await getEntity({ id: question.id, context })
    }))
}
