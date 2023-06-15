// import range from 'lodash/range'

// export type ToolExperienceId =
//     | 'would_not_use'
//     | 'not_interested'
//     | 'interested'
//     | 'would_use'
//     | 'never_heard'

// // should be updated depending on the survey
// export type ToolsSectionId =
//     | 'javascript_flavors'
//     | 'front_end_frameworks'
//     | 'datalayer'
//     | 'back_end_frameworks'
//     | 'testing'
//     | 'build_tools'
//     | 'mobile_desktop'
//     | 'other_tools'

// export type FeatureExperienceId = 'used' | 'heard' | 'never_heard'

// export type SimplifiedFeatureExperienceId = 'know_it' | 'used_it'

// // should be updated depending on the survey
// export type FeaturesSectionId =
//     | 'syntax'
//     | 'language'
//     | 'data_structures'
//     | 'browser_apis'
//     | 'other_features'

// export type GenderId = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say'

// export type YearlySalaryRangeId =
//     | 'range_work_for_free'
//     | 'range_0_10'
//     | 'range_10_30'
//     | 'range_30_50'
//     | 'range_50_100'
//     | 'range_100_200'
//     | 'range_more_than_200'

// export type CompanySizeRangeId =
//     | 'range_1'
//     | 'range_1_5'
//     | 'range_5_10'
//     | 'range_10_20'
//     | 'range_20_50'
//     | 'range_50_100'
//     | 'range_100_1000'
//     | 'range_more_than_1000'

// export type YearsOfExperienceRangeId =
//     | 'range_less_than_1'
//     | 'range_1_2'
//     | 'range_2_5'
//     | 'range_5_10'
//     | 'range_10_20'
//     | 'range_more_than_20'

// export type AgeRangeId =
//     | 'range_less_than_10'
//     | 'range_10_18'
//     | 'range_18_24'
//     | 'range_25_34'
//     | 'range_35_44'
//     | 'range_45_54'
//     | 'range_55_64'
//     | 'range_more_than_65'

// export type HigherEducationId = 'no_degree' | 'yes_related' | 'yes_unrelated'

// export type ProficiencyId = 'css_proficiency' | 'javascript_proficiency' | 'backend_proficiency'

// export type EnvironmentId = 'css_for_print' | 'css_for_email'

// export interface BucketKey<K extends string | number> {
//     id: K
//     label: string
// }

// export interface BucketKeyWithShortLabel<K extends string | number> extends BucketKey<K> {
//     shortLabel: string
// }

// const generateProficiencyKeys = (
//     proficiencyId: ProficiencyId
// ): {
//     keys: BucketKeyWithShortLabel<number>[]
// } => ({
//     keys: [0, 1, 2, 3, 4].map((id) => ({
//         id,
//         label: `options.${proficiencyId}.${id}`,
//         shortLabel: `options.proficiency.${id}`,
//     })),
// })

// const generateEnvironmentRatingKeys = (
//     environmentId: EnvironmentId
// ): {
//     keys: BucketKeyWithShortLabel<number>[]
// } => ({
//     keys: [0, 1, 2, 3].map((id) => ({
//         id,
//         label: `options.${environmentId}.${id}`,
//         shortLabel: `options.${environmentId}.${id}.short`,
//     })),
// })

// export const keys = {
//     yearly_salary: {
//         keys: [
//             'range_work_for_free',
//             'range_0_10',
//             'range_10_30',
//             'range_30_50',
//             'range_50_100',
//             'range_100_200',
//             'range_more_than_200',
//         ].map((id) => ({
//             id,
//             label: `options.yearly_salary.${id}`,
//             shortLabel: `options.yearly_salary.${id}.short`,
//         })) as BucketKeyWithShortLabel<YearlySalaryRangeId>[],
//     },
//     company_size: {
//         keys: [
//             'range_1',
//             'range_1_5',
//             'range_5_10',
//             'range_10_20',
//             'range_20_50',
//             'range_50_100',
//             'range_100_1000',
//             'range_more_than_1000',
//         ].map((id) => ({
//             id,
//             label: `options.company_size.${id}`,
//             shortLabel: `options.company_size.${id}.short`,
//         })) as BucketKeyWithShortLabel<CompanySizeRangeId>[],
//     },
//     years_of_experience: {
//         keys: [
//             'range_less_than_1',
//             'range_1_2',
//             'range_2_5',
//             'range_5_10',
//             'range_10_20',
//             'range_more_than_20',
//         ].map((id) => ({
//             id,
//             label: `options.years_of_experience.${id}`,
//             shortLabel: `options.years_of_experience.${id}.short`,
//         })) as BucketKeyWithShortLabel<YearsOfExperienceRangeId>[],
//     },
//     age: {
//         keys: [
//             'range_less_than_10',
//             'range_10_18',
//             'range_18_24',
//             'range_25_34',
//             'range_35_44',
//             'range_45_54',
//             'range_55_64',
//             'range_more_than_65',
//         ].map((id) => ({
//             id,
//             label: `options.age.${id}`,
//             shortLabel: `options.age.${id}.short`,
//         })) as BucketKeyWithShortLabel<YearsOfExperienceRangeId>[],
//     },
//     higher_education_degree: {
//         keys: ['no_degree', 'yes_related', 'yes_unrelated'].map((id) => ({
//             id,
//             label: `options.higher_education_degree.${id}`,
//             shortLabel: `options.higher_education_degree.${id}.short`,
//         })) as BucketKeyWithShortLabel<HigherEducationId>[],
//     },
//     gender: {
//         colorRange: 'gender',
//         keys: [
//             {
//                 id: 'male',
//                 label: 'options.gender.male',
//             },
//             {
//                 id: 'female',
//                 label: 'options.gender.female',
//             },
//             {
//                 id: 'non_binary',
//                 label: 'options.gender.non_binary',
//             },
//             {
//                 id: 'prefer_not_to_say',
//                 label: 'options.gender.prefer_not_to_say',
//             },
//         ] as BucketKey<GenderId>[],
//     },
//     race_ethnicity: {
//         keys: [
//             { id: 'black_african' },
//             { id: 'east_asian' },
//             { id: 'hispanic_latin' },
//             { id: 'middle_eastern' },
//             { id: 'multiracial' },
//             { id: 'native_american_islander_australian' },
//             { id: 'south_asian' },
//             { id: 'south_east_asian' },
//             { id: 'white_european' },
//         ],
//     },
//     environmentUsage: {
//         keys: [{ id: 'never' }, { id: 'occasionally' }, { id: 'often' }, { id: 'mainly' }],
//     },
//     jobTitle: {
//         keys: [
//             { id: 'full_stack_developer' },
//             { id: 'front_end_developer' },
//             { id: 'back_end_developer' },
//             { id: 'web_designer' },
//             { id: 'ui_designer' },
//             { id: 'ux_designer' },
//             { id: 'web_developer' },
//         ],
//     },
//     css_proficiency: generateProficiencyKeys('css_proficiency'),
//     javascript_proficiency: generateProficiencyKeys('javascript_proficiency'),
//     backend_proficiency: generateProficiencyKeys('backend_proficiency'),
//     happiness: {
//         keys: [0, 1, 2, 3, 4].map((id) => ({
//             id,
//             label: `options.happiness.${id}`,
//             shortLabel: `options.happiness.${id}.short`,
//         })) as BucketKeyWithShortLabel<number>[],
//     },
//     knowledge_score: {
//         keys: range(1, 100).map((n) => ({ id: n })),
//     },
//     opinions: {
//         colorRange: 'opinions',
//         keys: [
//             {
//                 id: 4,
//                 label: 'options.opinions.4',
//             },
//             {
//                 id: 3,
//                 label: 'options.opinions.3',
//             },
//             {
//                 id: 2,
//                 label: 'options.opinions.2',
//             },
//             {
//                 id: 1,
//                 label: 'options.opinions.1',
//             },
//             {
//                 id: 0,
//                 label: 'options.opinions.0',
//             },
//         ] as BucketKey<number>[],
//     },
//     tools: {
//         colorRange: 'tools',
//         keys: [
//             {
//                 id: 'would_not_use',
//                 label: 'options.tools.would_not_use.legend',
//                 shortLabel: 'options.tools.would_not_use.short',
//             },
//             {
//                 id: 'not_interested',
//                 label: 'options.tools.not_interested.legend',
//                 shortLabel: 'options.tools.not_interested.short',
//             },
//             {
//                 id: 'would_use',
//                 label: 'options.tools.would_use.legend',
//                 shortLabel: 'options.tools.would_use.short',
//             },
//             {
//                 id: 'interested',
//                 label: 'options.tools.interested.legend',
//                 shortLabel: 'options.tools.interested.short',
//             },
//             {
//                 id: 'never_heard',
//                 label: 'options.tools.never_heard.legend',
//                 shortLabel: 'options.tools.never_heard.short',
//             },
//         ] as BucketKeyWithShortLabel<ToolExperienceId>[],
//     },
//     // toolSections: {
//     //     keys: [
//     //         { id: 'pre_post_processors' },
//     //         { id: 'css_frameworks' },
//     //         { id: 'css_methodologies' },
//     //         { id: 'css_in_js' },
//     //     ],
//     // },
//     features: {
//         colorRange: 'features',
//         keys: [
//             {
//                 id: 'used',
//                 label: 'options.features.used.label',
//                 shortLabel: 'options.features.used.short',
//             },
//             {
//                 id: 'heard',
//                 label: 'options.features.heard.label',
//                 shortLabel: 'options.features.heard.short',
//             },
//             {
//                 id: 'never_heard',
//                 label: 'options.features.never_heard.label',
//                 shortLabel: 'options.features.never_heard.short',
//             },
//         ] as BucketKeyWithShortLabel<FeatureExperienceId>[],
//     },
//     features_simplified: {
//         colorRange: 'features_simplified',
//         keys: [
//             {
//                 id: 'know_it',
//                 label: 'options.features_simplified.know_it',
//             },
//             {
//                 id: 'used_it',
//                 label: 'options.features_simplified.used_it',
//             },
//         ] as BucketKey<SimplifiedFeatureExperienceId>[],
//     },
//     css_for_print: generateEnvironmentRatingKeys('css_for_print'),
//     css_for_email: generateEnvironmentRatingKeys('css_for_email'),
//     what_do_you_use_css_for: {
//         keys: [
//             'marketing_sites',
//             'design_systems',
//             'blogs',
//             'web_apps',
//             'mobile_apps',
//             'css_art',
//             'emails',
//             'printed_documents',
//         ].map((id) => ({
//             id,
//             label: `options.what_do_you_use_css_for.${id}`,
//             shortLabel: `options.what_do_you_use_css_for.${id}.short`,
//         })),
//     },
// }
