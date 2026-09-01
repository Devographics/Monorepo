import { RawDataItem } from './normalization'
import { ResultsSubFieldEnum } from './api'
import { Entity, Token } from './entities'
import { Option, SortOrder, SortProperty } from './outlines'
import { QuestionMetadata } from './metadata'

export type QueryData<T> = {
    result?: QueryResults<T>
    error?: any
}

export type QueryResults<T> = {
    surveys?: SurveysData<T>
}

export type SurveysData<T> = {
    [key: string]: SurveyData<T>
}

export type SurveyData<T> = {
    [key: string]: EditionData<T>
}
export type EditionData<T> = {
    [key: string]: SectionData<T>
}

export type SectionData<T> = {
    [key: string]: T
}

export interface QuestionData {
    id: string
}

export type AllQuestionData =
    | StandardQuestionData
    | OptionsQuestionData
    | FreeformQuestionData
    | ToolQuestionData
    | FeatureQuestionData
    | ToolRatiosQuestionData
    | OpinionQuestionData

export type StandardQuestionData = QuestionData & {
    id: string
    entity: Entity
    comments: ItemComments
    _metadata: QuestionMetadata
    _correlations: Correlations
    _cardinalities: Cardinalities
    rawData?: RawDataItem
} & {
    [key in Exclude<
        ResultsSubFieldEnum,
        | ResultsSubFieldEnum.METADATA
        | ResultsSubFieldEnum.ID
        | ResultsSubFieldEnum.ENTITY
        | ResultsSubFieldEnum.COMMENTS
        | ResultsSubFieldEnum.CORRELATIONS
        | ResultsSubFieldEnum.CARDINALITIES
        | ResultsSubFieldEnum.RAW_DATA
    >]: ResponseData
}

export interface OpinionQuestionData extends StandardQuestionData {}

export interface OptionsQuestionData extends QuestionData {
    options: OptionData[]
    responses: ResponseData
}

export interface FreeformQuestionData extends QuestionData {
    responses: ResponseData
}

export interface ToolQuestionData extends QuestionData {
    id: string
    comments: ItemComments
    entity: Entity
    responses: ResponseData
}

export interface FeatureQuestionData extends ToolQuestionData {}

export interface ItemComments {
    allEditions: EditionComments[]
    currentEdition: EditionComments
}

export interface EditionComments {
    year: number
    count: number
    commentsRaw: Comment[]
    commentsStats: WordCount[]
}

export interface WordCount {
    word: string
    count: number
}

export interface Comment {
    message: string
    messageHtml: string
    messageClean: string
    responseId: string
    responseValue: string
    experience: FeaturesOptions
    sentiment: SimplifiedSentimentOptions
}

export interface ResponseData {
    allEditions: ResponseEditionData[]
    currentEdition: ResponseEditionData
}

export interface ResponseEditionData {
    _metadata: ResponseEditionMetadata
    editionId: string
    year: number
    completion: YearCompletion
    buckets: Bucket[]
    average?: number
    percentiles?: PercentileData
    median?: number
    ratios?: RatiosData
}

export interface SortSpecifier {
    property: SortProperty
    order: SortOrder
}

export interface ResponseEditionMetadata {
    axis1Sort: SortSpecifier
    axis2Sort: SortSpecifier
    cutoff: number
    limit: number
}

export enum RatiosEnum {
    USAGE = 'usage',
    AWARENESS = 'awareness',
    INTEREST = 'interest',
    RETENTION = 'retention',
    POSITIVITY = 'positivity',
    APPRECIATION = 'appreciation',
    RELATIVE_POSITIVITY = 'positivityRelative'
}

export type RatiosData = {
    [key in RatiosEnum]: number
}

export interface OptionData extends Option {
    entity: Entity
}

export interface YearCompletion {
    // total number of participants
    total: number
    // total number of participants with filters applied
    filteredTotal: number
    // current number of respondents
    count: number
    // total number of answers
    answersCount: number
    // percentage of respondents compared to the total number of participants
    percentageSurvey: number
}

export interface FacetCompletion extends YearCompletion {
    // percentage of respondents compared to the total number of participants
    percentageQuestion: number
}

export enum BucketUnits {
    COUNT = 'count',
    // PERCENTAGE_FACET = 'percentageFacet',
    PERCENTAGE_QUESTION = 'percentageQuestion',
    PERCENTAGE_SURVEY = 'percentageSurvey',
    PERCENTAGE_BUCKET = 'percentageBucket',
    AVERAGE = 'averageByFacet',
    MEDIAN = 'medianByFacet',
    /**
     * Will favour a box plot instead of bars
     */
    PERCENTILES = 'percentilesByFacet'
}

export enum Percentiles {
    P0 = 'p0',
    P10 = 'p10',
    p25 = 'p25',
    p50 = 'p50',
    p75 = 'p75',
    p90 = 'p90',
    p100 = 'p100'
}

export type PercentileData = {
    [key in Percentiles]: number
}

export enum OtherPercentages {
    WOULD_NOT_USE_PERCENTAGE = 'would_not_use_percentage',
    NOT_INTERESTED_PERCENTAG = 'not_interested_percentage',
    WOULD_USE_PERCENTAGE = 'would_use_percentage',
    INTERESTED_PERCENTAGE = 'interested_percentage'
}

export type BucketData = {
    [key in Exclude<BucketUnits, BucketUnits.PERCENTILES>]?: number
}

export interface BucketMetadata {
    id: string
    entity?: Entity
    token?: Token
    label?: string
    value?: number
    index: number
    hasInsufficientData?: boolean
    isFreeformData?: boolean
    facetsCountSum?: number
    facetsPercentSum?: number
}

export interface Bucket extends BucketData, BucketMetadata {
    completion?: BucketCompletion
    facetBuckets: FacetBucket[]
    percentilesByFacet?: PercentileData
    groupedBuckets?: Bucket[]
    groupedBucketIds?: string[]
    nestedBuckets?: Bucket[]
    _metadata?: { sectionId?: string }
}

export type CombinedBucketData = {
    [key in BucketUnits as `${key}__${number}`]: number
}

export interface CombinedBucket extends Bucket, CombinedBucketData {}

export interface FacetBucket extends Omit<Bucket, 'facetBuckets' | 'groupedBuckets'> {
    groupedBuckets?: FacetBucket[]
}

export interface FacetBucketWithAverage extends FacetBucket {
    average: number
}

export interface BucketCompletion extends FacetCompletion {}

/*

Ratios

*/
export interface ToolRatiosQuestionData {
    items: ToolRatiosItemData[]
    ids: string[]
    years: number[]
}

export enum RatiosUnits {
    AWARENESS = 'awareness',
    USAGE = 'usage',
    INTEREST = 'interest',
    SATISFACTION = 'satisfaction'
}

export type ToolRatiosItemDataFields = {
    [key in RatiosUnits]: [ToolRatiosItemEditionData]
}

export interface ToolRatiosItemData extends QuestionData, ToolRatiosItemDataFields {
    entity: Entity
}

export interface ToolRatiosItemEditionData {
    year: number
    editionId: string
    rank: number
    percentageQuestion: number
}

/*

All tools in a section

*/

export interface AllToolsData {
    items: ToolQuestionData[]
    ids: string[]
    years: number[]
}
export interface SectionAllToolsData extends AllToolsData {}
export interface AllFeaturesData extends AllToolsData {}
export interface SectionAllFeaturesData extends AllFeaturesData {}

export const OPTION_NA = 'na'

export enum ToolsOptions {
    WOULD_USE = 'would_use',
    WOULD_NOT_USE = 'would_not_use',
    INTERESTED = 'interested',
    NOT_INTERESTED = 'not_interested',
    NEVER_HEARD = 'never_heard'
}

export enum FeaturesOptions {
    USED = 'used',
    HEARD = 'heard',
    NEVER_HEARD = 'never_heard'
}

export enum ExperienceOptions {
    USED = 'used',
    HEARD = 'heard',
    NEVER_HEARD = 'never_heard'
}

export enum SentimentOptions {
    INTERESTED = 'sentiment_interested',
    NOT_INTERESTED = 'sentiment_not_interested',
    POSITIVE_EXPERIENCE = 'sentiment_positive_experience',
    NEGATIVE_EXPERIENCE = 'sentiment_negative_experience'
}

export enum SimplifiedSentimentOptions {
    POSITIVE_SENTIMENT = 'positive',
    NEUTRAL_SENTIMENT = 'neutral',
    NEGATIVE_SENTIMENT = 'negative'
}

/*

Explorer

*/

export interface ExplorerData {
    items: ResponseEditionData[]
}

/*

Correlations (EXPERIMENTAL)

Automatically detected associations between survey variables. These are
statistical associations only and do not imply causation; they are generated
without human review, and no controls are applied for other variables.

Keep in sync with the Correlations types in
api/src/graphql/typedefs/schema.graphql

*/

export type CorrelationStrength = 'very_strong' | 'strong' | 'moderate' | 'weak'

export type CorrelationDirection = 'positive' | 'negative'

export interface CorrelationItem {
    questionId1: string
    sectionId1?: string
    /**
     * Set when the variable is one specific answer (e.g. one game of
     * favorite_video_games, or one gender option): the correlation is between
     * picking that answer or not, and the other variable
     */
    optionId1?: string
    questionId2: string
    sectionId2?: string
    optionId2?: string
    /** Number of respondents who answered both questions */
    n: number
    /**
     * Signed rank correlation (-1 to 1): positive means higher values of one
     * variable go with higher values of the other (for answers: picking the
     * answer goes with higher values), negative means the reverse
     */
    correlation: number
    /**
     * How strong the correlation is, judged against bands appropriate for its
     * type (answer correlations use lower thresholds, since binary variables
     * have a mechanical ceiling on their correlation)
     */
    strength: CorrelationStrength
    direction: CorrelationDirection
    sameSection: boolean
}

/** The strongest correlations involving one specific answer to a question */
export interface OptionCorrelations {
    /** Id of the option, matching the corresponding response bucket's id */
    id: string
    /** Strongest first */
    correlations: CorrelationItem[]
}

/** Correlations for a single question (the `_correlations` subfield) */
export interface Correlations {
    /**
     * Everything this question correlates with as a whole, strongest first.
     * Only questions whose options have an order (salary, experience…) take
     * part this way, so this is empty for questions like gender, whose
     * correlations all appear under optionCorrelations instead.
     */
    questionCorrelations: CorrelationItem[]
    /**
     * Correlations grouped by each of this question's own answers, for showing
     * indicators on individual options. Questions whose options have an order
     * populate this as well as questionCorrelations: the former covers patterns
     * specific to one band, the latter the overall trend.
     */
    optionCorrelations: OptionCorrelations[]
}

/** Every correlation detected across a whole edition, as a flat ranked list */
export interface EditionCorrelations {
    questionCorrelations: CorrelationItem[]
    answerCorrelations: CorrelationItem[]
}

/*

Cardinalities (EXPERIMENTAL)

For multiple-choice questions, the distribution of how many distinct answers
each respondent selected. Computed per question, always over every response of
the edition (not affected by filters on sibling fields). "na" selections are
excluded.

Keep in sync with the Cardinalities types in
api/src/graphql/typedefs/schema.graphql

*/

/** One point of the distribution: respondents who selected exactly `answerCount` answers */
export interface CardinalityBucket {
    answerCount: number
    count: number
    /** count as a percentage of n */
    percentage: number
}

/** Answer-count distribution for a single question (the `_cardinalities` subfield) */
export interface Cardinalities {
    /** Respondents who selected at least one answer */
    n: number
    /** Mean number of answers selected, across the n respondents */
    mean: number
    /** Highest number of answers any respondent selected */
    max: number
    /** One entry per observed answer count, ascending */
    buckets: CardinalityBucket[]
}
