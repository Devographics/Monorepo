import { test, expect, vi } from 'vitest'
import { makeTranslationFunction, makeTranslatorFunc } from './translate'
import type { LocaleParsed } from './typings'

const strings = [
    { key: 'greeting', t: 'Hello {name}', tHtml: '<p>Hello {name}</p>' },
    { key: 'takeaway', t: '{$main.range_0_4} of respondents', tHtml: '<p>{$main.range_0_4} of respondents</p>' },
    { key: 'mixed', t: '{name} said [over 30%]{$main.range_over_50.yes}' }
]

const locale = {
    id: 'en-US',
    label: 'English',
    strings,
    dict: Object.fromEntries(strings.map(s => [s.key, s]))
} as unknown as LocaleParsed

const { getMessage } = makeTranslationFunction(locale)
const getString = makeTranslatorFunc(locale)

test('placeholders are still filled in', () => {
    const result = getMessage('greeting', { name: 'Ada' })
    expect(result.t).toBe('Hello Ada')
    expect(result.tHtml).toBe('<p>Hello Ada</p>')
})

test('datapoints are left untouched, without warnings', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = getMessage('takeaway')
    expect(result.t).toBe('{$main.range_0_4} of respondents')
    expect(result.tHtml).toBe('<p>{$main.range_0_4} of respondents</p>')
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
})

test('placeholders and datapoints can be mixed', () => {
    expect(getMessage('mixed', { name: 'Ada' }).t).toBe(
        'Ada said [over 30%]{$main.range_over_50.yes}'
    )
})

test('legacy translator function also skips datapoints', () => {
    expect(getString('mixed', { values: { name: 'Ada' } }).t).toBe(
        'Ada said [over 30%]{$main.range_over_50.yes}'
    )
})
