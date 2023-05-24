/**
 * TODO: make this not hardcoded
 * To achieve that, load possible source from db or a config file on github
 * before generating the API graphql schema
 */
import { Option, QuestionTemplateOutput, TemplateFunction } from '@devographics/types'
import { DbSuffixes } from '@devographics/types'

type Sources = {
    [key in string]: SourceEdition
}
type SourceEdition = {
    [key in string]: Option[]
}

const sources: Sources = {
    state_of_graphql: {
        graphql2022: [
            {
                id: 'unknown'
            },
            {
                id: 'stateofjs'
            },
            {
                id: 'stateofgraphql'
            },
            {
                id: 'twitter'
            },
            {
                id: 'work'
            },
            {
                id: 'facebook'
            },
            {
                id: 'reddit_graphql'
            },
            {
                id: 'codrops'
            },
            {
                id: 'apollo'
            },
            {
                id: 'slack'
            },
            {
                id: 'meteor_community'
            },
            {
                id: 'google'
            },
            {
                id: 'discord'
            },
            {
                id: 'graphile_discord'
            },
            {
                id: 'prisma_slack'
            },
            {
                id: 'state_of_js_email'
            },
            {
                id: 'duckduckgo'
            },
            {
                id: 'word_of_mouth'
            },
            {
                id: 'stateofcss'
            },
            {
                id: 'graphql_wtf'
            }
        ]
    },
    state_of_css: {
        css2021: [
            {
                id: 'twitter'
            },
            {
                id: 'google'
            },
            {
                id: 'youtube'
            },
            {
                id: 'work'
            },
            {
                id: 'reddit'
            },
            {
                id: 'stateofcss'
            },
            {
                id: 'web_standards_ru'
            },
            {
                id: 'sidebar'
            },
            {
                id: 'codrops'
            },
            {
                id: 'kevin_j_powell'
            },
            {
                id: 'css_weekly'
            },
            {
                id: 'css_tricks'
            },
            {
                id: 'stateofjs'
            },
            {
                id: 'frontend_focus'
            },
            {
                id: 'telegram'
            },
            {
                id: 'facebook'
            },
            {
                id: 'slack'
            },
            {
                id: 'front_end_front'
            },
            {
                id: 'devto'
            },
            {
                id: 'linkedin'
            },
            {
                id: 'jen_simmons'
            },
            {
                id: 'js_weekly'
            },
            {
                id: 'sara_soueidan'
            }
        ],
        css2022: [
            {
                id: 'state_of_css_survey'
            },
            {
                id: 'kevin_j_powell'
            },
            {
                id: 'twitter'
            },
            {
                id: 'css_tricks'
            },
            {
                id: 'stateofjs'
            },
            {
                id: 'google'
            },
            {
                id: 'lea_verou'
            },
            {
                id: 'smashing_magazine'
            },
            {
                id: 'work'
            },
            {
                id: 'codrops'
            },
            {
                id: 'youtube'
            },
            {
                id: 'hn'
            },
            {
                id: 'mozilla'
            },
            {
                id: 'slack'
            },
            {
                id: 'microsoft_teams'
            },
            {
                id: 'web_standards_ru'
            },
            {
                id: 'sidebar'
            },
            {
                id: 'linkedin'
            },
            {
                id: 'reddit'
            },
            {
                id: 'duckduckgo'
            },
            {
                id: 'front_end_front'
            },
            {
                id: 'una_kravets'
            },
            {
                id: 'frontend_focus'
            },
            {
                id: 'levelup'
            }
        ],
        // TODO: update with correct sources
        css2023: [
            {
                id: 'state_of_css_survey'
            },
            {
                id: 'kevin_j_powell'
            },
            {
                id: 'twitter'
            },
            {
                id: 'css_tricks'
            },
            {
                id: 'stateofjs'
            },
            {
                id: 'google'
            },
            {
                id: 'lea_verou'
            },
            {
                id: 'smashing_magazine'
            },
            {
                id: 'work'
            },
            {
                id: 'codrops'
            },
            {
                id: 'youtube'
            },
            {
                id: 'hn'
            },
            {
                id: 'mozilla'
            },
            {
                id: 'slack'
            },
            {
                id: 'microsoft_teams'
            },
            {
                id: 'web_standards_ru'
            },
            {
                id: 'sidebar'
            },
            {
                id: 'linkedin'
            },
            {
                id: 'reddit'
            },
            {
                id: 'duckduckgo'
            },
            {
                id: 'front_end_front'
            },
            {
                id: 'una_kravets'
            },
            {
                id: 'frontend_focus'
            },
            {
                id: 'levelup'
            }
        ]
    },
    state_of_js: {
        js2021: [
            {
                id: 'twitter'
            },
            {
                id: 'stateofjs'
            },
            {
                id: 'google'
            },
            {
                id: 'stateofcss'
            },
            {
                id: 'angular_community'
            },
            {
                id: 'ionic_community'
            },
            {
                id: 'work'
            },
            {
                id: 'js_weekly'
            },
            {
                id: 'reddit'
            },
            {
                id: 'word_of_mouth'
            },
            {
                id: 'slack'
            },
            {
                id: 'web_standards_ru'
            },
            {
                id: 'linkedin'
            },
            {
                id: 'facebook'
            },
            {
                id: 'telegram'
            },
            {
                id: 'duckduckgo'
            },
            {
                id: 'bytes'
            },
            {
                id: 'discord'
            },
            {
                id: 'capacitor_community'
            },
            {
                id: 'evan_you'
            }
        ],
        js2022: [
            {
                id: 'state_of_js_survey'
            },
            {
                id: 'twitter'
            },
            {
                id: 'google'
            },
            {
                id: 'youtube'
            },
            {
                id: 'fireship'
            },
            {
                id: 'angular_community'
            },
            {
                id: 'js_weekly'
            },
            {
                id: 'reddit'
            },
            {
                id: 'scrimba'
            },
            {
                id: 'linkedin'
            },
            {
                id: 'work'
            },
            {
                id: 'word_of_mouth'
            },
            {
                id: 'duckduckgo'
            },
            {
                id: 'slack'
            },
            {
                id: 'discord'
            },
            {
                id: 'codrops'
            },
            {
                id: 'microsoft_teams'
            },
            {
                id: 'devto'
            },
            {
                id: 'state_of_css_survey'
            },
            {
                id: 'mastodon'
            },
            {
                id: 'midudev'
            },
            {
                id: 'web_standards_ru'
            },
            {
                id: 'bytes'
            },
            {
                id: 'facebook'
            },
            {
                id: 'telegram'
            },
            {
                id: 'vue_community'
            },
            {
                id: 'theo_browne'
            },
            {
                id: 'brave'
            },
            {
                id: 'kevin_j_powell'
            },
            {
                id: 'state_of_frontend'
            },
            {
                id: 'elm_community'
            },
            {
                id: 'james_q_quick'
            },
            {
                id: 'zero_to_mastery'
            },
            {
                id: 'front_end_front'
            },
            {
                id: 'github'
            },
            {
                id: 'svelte_community'
            },
            {
                id: 'bing'
            },
            {
                id: 'twitch'
            },
            {
                id: 'coding_garden'
            },
            {
                id: 'kode24'
            },
            {
                id: 'rich_harris'
            },
            {
                id: 'frontend_focus'
            },
            {
                id: 'jser'
            },
            {
                id: 'ryan_carniato'
            },
            {
                id: 'changelog'
            },
            {
                id: 'state_of_purescript'
            },
            {
                id: 'eleventy'
            },
            {
                id: 'hn'
            },
            {
                id: 'instagram'
            }
        ],
        js2023: [
            {
                id: 'state_of_js_survey'
            },
            {
                id: 'twitter'
            },
            {
                id: 'google'
            },
            {
                id: 'youtube'
            },
            {
                id: 'fireship'
            },
            {
                id: 'angular_community'
            },
            {
                id: 'js_weekly'
            },
            {
                id: 'reddit'
            },
            {
                id: 'scrimba'
            },
            {
                id: 'linkedin'
            },
            {
                id: 'work'
            },
            {
                id: 'word_of_mouth'
            },
            {
                id: 'duckduckgo'
            },
            {
                id: 'slack'
            },
            {
                id: 'discord'
            },
            {
                id: 'codrops'
            },
            {
                id: 'microsoft_teams'
            },
            {
                id: 'devto'
            },
            {
                id: 'state_of_css_survey'
            },
            {
                id: 'mastodon'
            },
            {
                id: 'midudev'
            },
            {
                id: 'web_standards_ru'
            },
            {
                id: 'bytes'
            },
            {
                id: 'facebook'
            },
            {
                id: 'telegram'
            },
            {
                id: 'vue_community'
            },
            {
                id: 'theo_browne'
            },
            {
                id: 'brave'
            },
            {
                id: 'kevin_j_powell'
            },
            {
                id: 'state_of_frontend'
            },
            {
                id: 'elm_community'
            },
            {
                id: 'james_q_quick'
            },
            {
                id: 'zero_to_mastery'
            },
            {
                id: 'front_end_front'
            },
            {
                id: 'github'
            },
            {
                id: 'svelte_community'
            },
            {
                id: 'bing'
            },
            {
                id: 'twitch'
            },
            {
                id: 'coding_garden'
            },
            {
                id: 'kode24'
            },
            {
                id: 'rich_harris'
            },
            {
                id: 'frontend_focus'
            },
            {
                id: 'jser'
            },
            {
                id: 'ryan_carniato'
            },
            {
                id: 'changelog'
            },
            {
                id: 'state_of_purescript'
            },
            {
                id: 'eleventy'
            },
            {
                id: 'hn'
            },
            {
                id: 'instagram'
            }
        ]
    }
}

export const source: TemplateFunction = ({ survey, edition, question, section }) => {
    const options = sources[survey.id][edition.id]
    if (!options) {
        throw new Error(
            `Could not find source options for edition ${edition.id} (defined in /shared/templates/source)`
        )
    }
    const output: QuestionTemplateOutput = {
        id: 'source',
        options: sources[survey.id][edition.id],
        normPaths: {
            response: `user_info.source.${DbSuffixes.NORMALIZED}`
        },
        ...question
    }
    return output
}
