import { compareArrays } from '../compareArrays'

describe('compareArrays', () => {
  it('should fail if arrays are different lengths', () => {
    expect(compareArrays(['a'], ['a', 'b'])).toBe(false)
  })

  it('should fail if arrays are different', () => {
    expect(compareArrays(['a', 'b'], ['a', 'c'])).toBe(false)
  })

  it('should pass if arrays are the same', () => {
    expect(compareArrays(['a', 'b'], ['a', 'b'])).toBe(true)
  })
})
