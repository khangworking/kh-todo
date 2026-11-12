import { expect, test } from 'vitest'
import { titleize } from './titleize'

test.each([
  ['mua sữa ở siêu thị', 'Mua Sữa Ở Siêu Thị'],
  ['fix API bug', 'Fix API Bug'],
  ['buy iPhone', 'Buy IPhone'],
  ['đi chợ mua cá', 'Đi Chợ Mua Cá'],
  ['123 tasks & chores', '123 Tasks & Chores'],
  ['', ''],
])('titleizes %j as %j', (input, expected) => {
  expect(titleize(input)).toBe(expected)
})

test('trims the ends while preserving internal whitespace', () => {
  expect(titleize('  one   two\tthree\nfour  ')).toBe('One   Two\tThree\nFour')
})

test('uses the first Unicode code point without splitting it', () => {
  expect(titleize('😀 smile')).toBe('😀 Smile')
})
