# Takeaway datapoints

Takeaway strings (stored in the locale repos) can refer to a chart's data, either to insert a value or to make any text highlight a chart element on hover.

## Two forms

| Form | Renders as | Use for |
|---|---|---|
| `{path}` | the formatted value, linked to the chart | figures that should stay in sync with the data |
| `[text]{path}` | `text` unchanged, linked to the chart | rounded or worded figures ("over 30%", "half"), rankings ("the most popular"), naming a group |

```md
{$main.range_0_4} of respondents had 4 years of professional experience or less.
React remained [the most popular]{$main.react} web framework.
[Over 30%]{$main_vs_job_search_status.range_over_50.yes} of those who worked 50+ hours were looking for a new job.
```

## Path syntax

```
block[:edition][.bucket[.facetBucket]][.stat]
```

### `block` (required)

- A variant id as it appears in the page data: `gender_vs_salary`, `years_in_japan_by_country`.
- `$main`: the main chart of the block the takeaway belongs to (`user_info.japan_province.takeaway` → `japan_province`).
- `$main_<suffix>`: the block id followed by that suffix (`$main_vs_salary` in the `gender` takeaway → `gender_vs_salary`).
- Filtered series end in their position in the sitemap's filters: `number_of_kids_married_2`.

### `:edition` (optional)

Reads another edition from the same data: `{$main:devs2025.up_to_employee}`. Only works when the data includes that edition (main blocks usually include the previous one; `_vs_` variants usually don't).

`:` is used rather than `@` because markdown turns `main@devs2025.foo` into an email link.

### `bucket` / `facetBucket` (optional)

- Bucket ids exactly as in the data: `man`, `range_over_50`, `IND`, `overall`, `range_0`.
- `+` combines buckets. In `{path}` the values are summed (`{$main.range_20_29+range_30_39}`); in `[text]{path}` all of them are highlighted (`[Elixir, Kotlin, and Swift users]{programming_languages_vs_salary.elixir+kotlin+swift}`).
- Only percentages and counts can be summed.

### `stat` (optional)

- Defaults to the percentage: `percentageQuestion` for a bucket, `percentageBucket` for a facet bucket.
- Other stats: `count`, `median` (= `p50`), any percentile `pNN` (`p25`, `p75`…), `average`.
- With no bucket, the stat applies to the whole question and is required: `{$main.median}` (edition's `percentiles.p50`), `{$main.average}`, `{$main.count}` (number of respondents).

## Named values

> Not implemented yet: postponed as an optional nice-to-have.

Figures that can't be read from the data directly (ratios, differences, editions the data doesn't include, counts hidden in `cutoff_answers`…) are hardcoded once, for all locales, on the block or variant in `raw_sitemap.yml`:

```yaml
- id: current_employer_vs_salary
  datapoints:
      subsidiary_premium:
          value: 35
          unit: percentage
          path: japanese_subsidiary.median+japanese_company.median
      premium_2022:
          value: 93
          unit: percentage
```

| Field | Required | Meaning |
|---|---|---|
| `value` | yes | the number shown in the text |
| `unit` | no | how to format it; defaults to the unit of `path`'s stat, or a plain number |
| `path` | no | chart elements highlighted on hover (relative to the block, `+` for several); without it the figure isn't linked |

Named values are used like a bucket, with either form:

```md
…made {$main_vs_salary.subsidiary_premium} more than…
Survey respondents hailed from {$main.country_count} different countries or regions.
```

The sitemap is per edition, so named values are naturally tied to an edition.

## Formatting

- Text never contains formatting: a token outputs the complete formatted value based on the question's unit (percentage, currency, years…) and the locale. The same token renders `¥9.5 million` in en-US and `950万円` in ja-JP.
- Translators keep paths unchanged and only translate the surrounding text (including the `[text]` part).

## Parsing rules

- A dot inside braces marks a datapoint; existing i18n placeholders like `{name}` have no dot and keep working.
- In `[text]{path}`, the `{` must immediately follow the `]`; no `]` inside the text, no nesting.
- Ids can't contain `.`, `+` or `:`, and a bucket id or named value can't match a stat name (`median`, `count`, `p75`…).
- A named value can't share its name with a bucket id of the same block.
- Markdown works as usual, including inside `[text]`.

## Rendering

- Both forms go through the API's markdown step unchanged; the results app parses them in the takeaway's HTML (this keeps chart data and multilingual takeaways separate).
- Values are filled in while rendering, so they're server-rendered at build time.
- Values come from the block's default data, not from whatever filters the reader applies.
- An unresolved path renders as `[?path]` in dev and logs a build warning.

## Highlighting

- Chart elements carry matching ids (`data-datapoint="react"` on a bar, `react.years_of_experience` on a cell).
- The stat is ignored when matching: `{$main.react.count}` highlights the `react` bar.
- Hovering or focusing a linked span highlights the matching elements (spans are keyboard-focusable).
- `[text]` links show the exact value in the site's regular tooltip.
- Clicking a datapoint (or pressing Enter) opens the tab its data is in.
- No matching element (question-level stats, other editions, p75 without a boxplot…) means nothing is highlighted.

## Rankings

Link to the bucket, not to a rank: `[the most popular]{$main.react}`, never `rank_1`. If something else took the top spot, a rank-based link would highlight it next to a sentence about React.

## Validation report

A script writes a `.yml` report (and changes nothing) listing, for every takeaway in every locale:

- each token's full path (with `$main…` expanded) and current value;
- each named value's hardcoded `value` next to the current values of its `path`, to spot drift;
- issues: unresolved paths, named values clashing with bucket ids.

## Implementation

- Path resolver: `results/src/core/helpers/datapoints.ts` (tests in `results/tests/`, run with `npm test` in `results`).
- Rendering: `renderDatapoints({ takeaway, pageContext, blockId })` in `results/src/core/helpers/renderDatapoints.ts` (formatting included), called from `BlockTakeaway` through `T`'s `renderHtml` prop, then parsed into React with `html-react-parser` (`parseTakeaway` in `results/src/core/components/Datapoint.tsx`), which turns each datapoint span into a `Datapoint` component; the pure string replacement is `replaceDatapoints` in `datapoints.ts`. Values are formatted with the locale-aware `formatLocalizedValue` from `results/src/core/charts/common2/helpers/format.ts`, which chart labels also use (with short units, e.g. "12 yrs").
- Highlighting: `results/src/core/components/Highlight.tsx`. `BlockTabsWrapper` provides the hover state (`HighlightProvider`) and owns the active tab, `Datapoint` components set the hover state (hover/focus) and open their chart's tab (click/Enter), and chart elements declare their ids explicitly with `<Highlight blockId bucketId facetBucketId>` (or `useHighlight()` for components that don't pass `className` through). Elements get `datapoint-target` or `datapoint-ancestor` classes, separate from the charts' own hover classes. Datapoints carry their edition: elements with an `editionId` (verticalBar2 columns and cells) must match it, other elements with bucket ids are assumed to show the current edition, and tabs match any edition. Done so far: tabs, horizontalBar2 rows and stacked bar segments, verticalBar2 edition columns and stacked cells, and `TwoSeriesScatterplot` nodes (not verticalBar2 lines yet).
- i18n placeholders skip anything containing a dot: `INTERPOLATION_REGEX` in `shared/i18n/translate.ts` (tests in `shared/i18n/translate.test.ts`, run with `pnpm test` in `shared/i18n`).
