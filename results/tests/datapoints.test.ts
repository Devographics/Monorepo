// Run with: node --test tests/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseDatapointPath, resolveDatapoint } from '../src/core/helpers/datapoints.ts'

const pageData = JSON.parse(
    readFileSync(new URL('./fixtures/devs2026_career.json', import.meta.url), 'utf8')
)

const getContext = (blockId: string) => ({
    pageData,
    surveyId: 'state_of_devs',
    editionId: 'devs2026',
    blockId
})

test('parses a full path', () => {
    assert.deepEqual(parseDatapointPath('$main_vs_salary:devs2025.a+b.c.p75', 'employment_status'), {
        blockId: 'employment_status_vs_salary',
        editionId: 'devs2025',
        bucketLevels: [['a', 'b'], ['c']],
        stat: 'p75'
    })
})

test('bucket percentage from the main block', () => {
    const result = resolveDatapoint('$main.range_0_4', getContext('years_of_experience'))
    assert.equal(result.value, 8.67)
    assert.equal(result.stat, 'percentage')
    assert.equal(result.fullPath, 'years_of_experience.range_0_4')
    assert.deepEqual(result.elementIds, ['range_0_4'])
    assert.equal(result.error, undefined)
})

test('full block id works the same as $main', () => {
    const result = resolveDatapoint('years_of_experience.range_0_4', getContext('employment_status'))
    assert.equal(result.value, 8.67)
})

test('previous edition', () => {
    const result = resolveDatapoint('$main:devs2025.range_0_4', getContext('years_of_experience'))
    assert.equal(result.value, 16)
})

test('summed buckets', () => {
    const result = resolveDatapoint('$main.range_0_4+range_5_9', getContext('years_of_experience'))
    assert.equal(Math.round(result.value! * 100) / 100, 33.85)
    assert.deepEqual(result.elementIds, ['range_0_4', 'range_5_9'])
})

test('bucket count', () => {
    const result = resolveDatapoint('$main.freelance.count', getContext('employment_status'))
    assert.equal(result.value, 1110)
})

test('facet bucket percentage from a variant', () => {
    const context = getContext('employment_status')
    const employees = resolveDatapoint('$main_vs_income_evolution.company_employee.increased', context)
    assert.equal(employees.value, 52.84)
    assert.equal(employees.blockId, 'employment_status_vs_income_evolution')
    assert.deepEqual(employees.elementIds, ['company_employee.increased'])
    const freelancers = resolveDatapoint('$main_vs_income_evolution.freelance.increased', context)
    assert.equal(freelancers.value, 32.61)
})

test('bucket median and percentile', () => {
    const context = getContext('employment_status')
    assert.equal(resolveDatapoint('$main_vs_salary.company_employee.median', context).value, 90000)
    assert.equal(resolveDatapoint('$main_vs_salary.company_employee.p75', context).value, 125000)
    assert.equal(resolveDatapoint('$main_vs_salary.company_employee.average', context).value, 96481.5)
})

test('question-level stats', () => {
    const context = getContext('years_of_experience')
    assert.equal(resolveDatapoint('$main.median', context).value, 12)
    assert.equal(resolveDatapoint('$main.average', context).value, 14.4)
    assert.equal(resolveDatapoint('$main.count', context).value, 5356)
})

test('filtered series', () => {
    const result = resolveDatapoint('$main_men_vs_non_men_1.burnout', getContext('career_issues'))
    assert.equal(result.value, 68.22)
})

test('errors', () => {
    const context = getContext('years_of_experience')
    assert.match(resolveDatapoint('$main_foo.range_0_4', context).error!, /No data found for block/)
    assert.match(resolveDatapoint('$main:devs2020.range_0_4', context).error!, /No data found for edition/)
    assert.match(resolveDatapoint('$main.range_foo', context).error!, /No bucket "range_foo"/)
    assert.match(resolveDatapoint('$main', context).error!, /A stat .* is needed/)
    assert.match(
        resolveDatapoint('employment_status_vs_salary.company_employee+freelance.median', context).error!,
        /cannot be combined/
    )
})
