import type { CorrelationStrength } from '@devographics/types'

/*

Every tuning knob for the correlations feature, in one place.

Changing any of these changes the computed results, so bump CACHE_VERSION at
the same time or existing editions will keep serving their cached output.

*/

// bump to invalidate cached results when the algorithm or any knob below changes
export const CACHE_VERSION = 17

/*

Compute-time thresholds: these decide what gets into the cached dataset at all,
and are the reason a pair can be missing entirely rather than merely hidden.

*/

// discard pairs with fewer respondents than this having answered both questions
export const MIN_PAIRWISE_N = 100
// discard pairs below this correlation strength; answer expansion produces
// hundreds of binary variables, and keeping every near-zero pair would bloat
// the cached result with noise
export const MIN_CORRELATION = 0.05
// keep at most this many distinct values per question, most common first
export const MAX_CARDINALITY = 30
// binary (per-option) variables need at least this many respondents on each
// side (selected/not selected) to be worth correlating
export const MIN_OPTION_SELECTIONS = 30

/*

Presentation limits: applied when slicing the cached dataset for a consumer, so
these can change without recomputing anything.

*/

// how many correlations to return for a question as a whole…
export const QUESTION_CORRELATIONS_LIMIT = 15
// …and for each of its individual options
export const OPTION_CORRELATIONS_LIMIT = 15
// how many (sorted) pairs to return at the edition level
export const EDITION_CORRELATIONS_LIMIT = 1000

/*

Strength bands (lower bound of |correlation| for each label).

One scale is used for every kind of correlation. Binary "picked it or not"
variables do have a mechanical ceiling below 1, which once justified scoring
them on a separate, lower scale — but that ceiling depends on how common the
answer is, so a single fixed discount corrected nothing while making labels
inconsistent wherever the two kinds appear in the same list.

*/
export const CORRELATION_STRENGTH_BANDS: [CorrelationStrength, number][] = [
    ['very_strong', 0.4],
    ['strong', 0.25],
    ['moderate', 0.15]
]

/*

Survey-process meta questions: they generate statistically valid but
uninteresting pairs (e.g. people who skipped questions also skipped other
questions), so keep them out of the correlations dataset entirely.

Note this is a blunt, global list. Excluding a *pair* of questions that are
definitionally linked is done per-question in the survey outline instead, via
`doNotCorrelateWith`.

*/
export const EXCLUDED_QUESTION_IDS = [
    'authmode',
    'completion_stats',
    'did_you_run_into_technical_issues',
    'how_can_we_improve',
    'how_did_user_find_out_about_the_survey',
    'knowledge_score',
    'missing_questions',
    'skipped',
    'source',
    'survey_feedback'
]
