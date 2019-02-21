import { Seed } from '../types'

/**
 * Generates a random integer using a pseudo random generator
 *
 * @param seed pseudo random number generator
 * @param min minimum number (inclusive)
 * @param max maximum number (non-inclusive)
 */
export function getRandomInt(seed: Seed, min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(seed() * (max - min)) + min // The maximum is exclusive and the minimum is inclusive
}
