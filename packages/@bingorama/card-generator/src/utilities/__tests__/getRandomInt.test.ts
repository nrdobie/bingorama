import * as createSeed from 'seed-random'
import { getRandomInt } from '../getRandomInt'

describe('getRandomInt', () => {
  it.each`
    seedValue  | value
    ${'alpha'} | ${47}
    ${'beta'}  | ${83}
  `(
    'should generate a random it using $seedValue seed',
    ({ seedValue, value }) => {
      const seed = createSeed(seedValue)

      expect(getRandomInt(seed, 1, 100)).toBe(value)
    }
  )
})
