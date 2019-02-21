import { performance } from 'perf_hooks'
import * as createSeed from 'seed-random'
import { ClassicMatcher } from './ClassicMatcher'
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
export class CardGeneratorWithCM {
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

  private cm = new ClassicMatcher()

  constructor(options: Partial<ICardGeneratorOptions> = {}) {
    this.options = {
      ...CardGeneratorWithCM.DEFAULT_OPTIONS,
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

      if (this.options.allowDuplicates || !this.cm.checkCard(card)) {
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
