// Run with: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatLocalizedValue, type LocalizedUnit } from '../src/core/charts/common2/helpers/format.ts'

// Intl uses non-breaking spaces in some locales (e.g. "53 %" in French)
const format = (options: { value: number; unit: LocalizedUnit; localeId: string }) =>
    formatLocalizedValue(options).replace(/[\u00a0\u202f]/g, ' ')

test('percentages', () => {
    assert.equal(format({ value: 52.84, unit: 'percentage', localeId: 'en-US' }), '53%')
    assert.equal(format({ value: 52.84, unit: 'percentage', localeId: 'fr-FR' }), '53 %')
    assert.equal(format({ value: 0.42, unit: 'percentage', localeId: 'en-US' }), '0.4%')
})

test('counts', () => {
    assert.equal(format({ value: 5356, unit: 'count', localeId: 'en-US' }), '5,356')
    assert.equal(format({ value: 5356, unit: 'count', localeId: 'de-DE' }), '5.356')
})

test('dollars', () => {
    assert.equal(format({ value: 90000, unit: 'usd', localeId: 'en-US' }), '$90,000')
    assert.equal(format({ value: 90000, unit: 'usd', localeId: 'fr-FR' }), '90 000 $US')
})

test('yen', () => {
    assert.equal(format({ value: 9500000, unit: 'jpy', localeId: 'en-US' }), '¥9.5M')
    assert.equal(format({ value: 9500000, unit: 'jpy', localeId: 'ja-JP' }), '950万円')
})

test('years', () => {
    assert.equal(format({ value: 12, unit: 'years', localeId: 'en-US' }), '12 years')
    assert.equal(format({ value: 12, unit: 'years', localeId: 'ja-JP' }), '12 年')
})
