import { performance } from 'perf_hooks'
import * as createSeed from 'seed-random'
import { Card, Seed } from './types'
import { compareArrays } from './utilities/compareArrays'
import { getRandomInt } from './utilities/getRandomInt'

const NUMBER_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

export interface ICardGeneratorOptions {
  /**
   * Random seed to use for generating cards, same seed will deliver same cards.
   * When null a random seed will be used.
   */
  seed: string | null

  /**
   * When false generate will check if the card could trigger a double bingo when using classic bingo rules
   */
  allowDuplicates: boolean

  /**
   * Adds a free spaces to the middle of the I column
   */
  includeFreeSpace: boolean

  /**
   * Increases randomness by adding more shuffles to the columns
   */
  shuffleIterations: number

  /**
   * Maximum number of duplicate cards in a row before quitting
   */
  duplicateThreshold: number

  /**
   * Time between progress check-ins
   */
  progressRate: number
}

/**
 * Generates bingo card
 */
export class CardGenerator {
  /**
   * Default options for generating cards
   */
  public static DEFAULT_OPTIONS: ICardGeneratorOptions = {
    seed: null,
    allowDuplicates: false,
    includeFreeSpace: true,
    shuffleIterations: 250,
    duplicateThreshold: 100,
    progressRate: 100
  }

  /**
   * Options currently set
   */
  public options: ICardGeneratorOptions

  constructor(options: Partial<ICardGeneratorOptions> = {}) {
    this.options = {
      ...CardGenerator.DEFAULT_OPTIONS,
      ...options
    }
  }

  /**
   * Generates a large amount of cards. Will short circuit if no longer able to generate new cards.
   *
   * @param count number of cards to generate
   * @param progressCallback tracks progress of card generation
   */
  public async generateCards(
    count: number,
    progressCallback?: (generated: number) => void
  ): Promise<Card[]> {
    let runningDuplicates = 0
    let lastProgress = performance.now()
    const cards: Card[] = []
    const seed = createSeed(this.options.seed || Math.random().toString())

    while (cards.length < count) {
      const card = await this.generateCard(seed)

      if (
        this.options.allowDuplicates ||
        !cards.some(a => this.classicMatch(a, card))
      ) {
        runningDuplicates = 0
        cards.push(card)

        if (
          progressCallback &&
          performance.now() - lastProgress > this.options.progressRate
        ) {
          lastProgress = performance.now()
          progressCallback(cards.length)
        }
      } else {
        runningDuplicates++

        if (runningDuplicates > this.options.duplicateThreshold) {
          break
        }
      }
    }

    return cards
  }

  /**
   * Creates a new card.
   * @param seed pseudo random number generator
   */
  public generateCard(seed: Seed): Promise<Card> {
    return new Promise(resolve => {
      const card = []

      for (let i = 0; i < 5; i++) {
        const numbers = this.getShuffledNumberList(seed)

        // I free space
        if (i === 2 && this.options.includeFreeSpace) {
          card.push(...numbers.slice(0, 2), 0, ...numbers.slice(2, 4))
        } else {
          card.push(...numbers.slice(0, 5))
        }
      }

      setTimeout(() => resolve(card as Card), 0)
    })
  }

  /**
   * Checks if two cards can trigger double bingo with classic bingo rules
   * @param a Card A
   * @param b Card B
   */
  public classicMatch(a: Card, b: Card): boolean {
    // Check for direct match
    if (compareArrays(a, b)) {
      return true
    }

    // Check for column match
    for (let i = 0; i < 5; i++) {
      const start = i * 5
      const end = start + 5

      if (compareArrays(a.slice(start, end), b.slice(start, end))) {
        return true
      }
    }

    // Check for row match
    for (let i = 0; i < 5; i++) {
      const aList = [a[i], a[i + 5], a[i + 10], a[i + 15], a[i + 20]]
      const bList = [b[i], b[i + 5], b[i + 10], b[i + 15], b[i + 20]]

      if (compareArrays(aList, bList)) {
        return true
      }
    }

    // Check for diagonals
    const aListDiagonalRight = [a[0], a[6], a[12], a[18], a[24]]
    const bListDiagonalRight = [b[0], b[6], b[12], b[18], b[24]]

    if (compareArrays(aListDiagonalRight, bListDiagonalRight)) {
      return true
    }

    const aListDiagonalLeft = [a[4], a[8], a[12], a[16], a[20]]
    const bListDiagonalLeft = [b[4], b[8], b[12], b[16], b[20]]

    if (compareArrays(aListDiagonalLeft, bListDiagonalLeft)) {
      return true
    }

    return false
  }

  /**
   * Returns a shuffled list of possible numbers
   *
   * @param seed pseudo random number generator
   */
  private getShuffledNumberList(seed: Seed) {
    const shuffledNumberList = [...NUMBER_LIST]

    for (let i = 0; i < this.options.shuffleIterations; i++) {
      shuffledNumberList.sort(() => getRandomInt(seed, -1, 2))
    }

    return shuffledNumberList
  }
}
