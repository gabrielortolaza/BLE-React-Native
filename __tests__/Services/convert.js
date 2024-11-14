const Convert = require('../../src/Services/Convert').default

describe('Convert', () => {
  it('fluidFrom', () => {
    expect(Convert.fluidFrom()).toBe(0)
    expect(Convert.fluidFrom({})).toBe(0)
    expect(Convert.fluidFrom({ showUnit: true })).toBe('0 mL')

    expect(Convert.fluidFrom({ value: 10 })).toBe(10)
    expect(Convert.fluidFrom({ value: 10, showUnit: true })).toBe('10 mL')
    expect(Convert.fluidFrom({ value: 100, showUnit: true })).toBe('100 mL')
    expect(Convert.fluidFrom({ value: 1000, showUnit: true })).toBe('1 L')
    expect(Convert.fluidFrom({ value: -10 })).toBe(-10)
    expect(Convert.fluidFrom({ value: -10, showUnit: true })).toBe('-10 mL')

    expect(Convert.fluidFrom({ measureUnit: 'uk_ounce', value: 10 })).toBe(284.13)
    expect(Convert.fluidFrom({ measureUnit: 'uk_ounce', value: 10, showUnit: true })).toBe('284.13 oz')
    expect(Convert.fluidFrom({ measureUnit: 'uk_ounce', value: -10, showUnit: true })).toBe('-284.13 oz')
    expect(Convert.fluidFrom({ measureUnit: 'uk_ounce', value: 10000 })).toBe(284131)

    expect(Convert.fluidFrom({ measureUnit: 'uk_ounce', value: 0.42 })).toBe(11.93)
    expect(Convert.fluidFrom({ measureUnit: 'uk_ounce', value: 1.28 })).toBe(36.37)

    expect(Convert.fluidFrom({ measureUnit: 'us_ounce', value: 10 })).toBe(295.74)
    expect(Convert.fluidFrom({ measureUnit: 'us_ounce', value: 10, showUnit: true })).toBe('295.74 oz')
    expect(Convert.fluidFrom({ measureUnit: 'us_ounce', value: -10, showUnit: true })).toBe('-295.74 oz')
    expect(Convert.fluidFrom({ measureUnit: 'us_ounce', value: 10000 })).toBe(295735)

    expect(Convert.fluidFrom({ measureUnit: 'us_ounce', value: 0.41 })).toBe(12.13)
    expect(Convert.fluidFrom({ measureUnit: 'us_ounce', value: 1.23 })).toBe(36.38)
  })

  it('fluidTo', () => {
    expect(Convert.fluidTo()).toBe(0)
    expect(Convert.fluidTo({})).toBe(0)
    expect(Convert.fluidTo({ showUnit: true })).toBe('0 mL')

    expect(Convert.fluidTo({ value: 10 })).toBe(10)
    expect(Convert.fluidTo({ value: 10, showUnit: true })).toBe('10 mL')
    expect(Convert.fluidTo({ value: 100, showUnit: true })).toBe('100 mL')
    expect(Convert.fluidTo({ value: 1000, showUnit: true })).toBe('1 L')

    expect(Convert.fluidTo({ measureUnit: 'uk_ounce', value: 284.13 })).toBe(10)
    expect(Convert.fluidTo({ measureUnit: 'uk_ounce', value: 284.13, showUnit: true })).toBe('10 oz')
    expect(Convert.fluidTo({ measureUnit: 'uk_ounce', value: 284131 })).toBe(10000)

    expect(Convert.fluidTo({ measureUnit: 'uk_ounce', value: 12 })).toBe(0.42)
    expect(Convert.fluidTo({ measureUnit: 'uk_ounce', value: 36.38 })).toBe(1.28)

    expect(Convert.fluidTo({ measureUnit: 'us_ounce', value: 295.74 })).toBe(10)
    expect(Convert.fluidTo({ measureUnit: 'us_ounce', value: 295.74, showUnit: true })).toBe('10 oz')
    expect(Convert.fluidTo({ measureUnit: 'us_ounce', value: 295735 })).toBe(10000)

    expect(Convert.fluidTo({ measureUnit: 'us_ounce', value: 12 })).toBe(0.41)
    expect(Convert.fluidTo({ measureUnit: 'us_ounce', value: 36.38 })).toBe(1.23)
  })
})
