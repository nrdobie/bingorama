import * as createSeed from 'seed-random'
import { CardGenerator } from '../CardGenerator'
import { Card, Seed } from '../types'

describe('CardGenerator', () => {
  let cardGenerator: CardGenerator

  beforeEach(() => {
    cardGenerator = new CardGenerator()
  })

  describe('#generateCards', () => {
    let generateCardSpy: jest.SpyInstance<Promise<Card>, [Seed]>
    let cardA: Card
    let cardB: Card

    beforeEach(() => {
      cardGenerator.options.seed = 'test'

      generateCardSpy = jest.spyOn(cardGenerator, 'generateCard')

      // prettier-ignore
      cardA = [
        1, 2, 3, 4, 5,
        1, 2, 3, 4, 5,
        1, 2, 3, 4, 5,
        1, 2, 3, 4, 5,
        1, 2, 3, 4, 5
      ]

      // prettier-ignore
      cardB = [
        11, 12, 13, 14, 15,
        11, 12, 13, 14, 15,
        11, 12, 13, 14, 15,
        11, 12, 13, 14, 15,
        11, 12, 13, 14, 15
      ]
    })

    it('should generate a card set', async () => {
      await expect(cardGenerator.generateCards(2)).resolves.toMatchSnapshot()
    })

    it('should generate random seeds', async () => {
      cardGenerator.options.seed = null

      const setA = await cardGenerator.generateCards(2)
      const setB = await cardGenerator.generateCards(2)

      expect(setA).not.toEqual(setB)
    })

    it('should remove duplicates', async () => {
      generateCardSpy
        .mockReturnValueOnce(Promise.resolve(cardA))
        .mockReturnValueOnce(Promise.resolve(cardA))
        .mockReturnValueOnce(Promise.resolve(cardB))
      await expect(cardGenerator.generateCards(2)).resolves.toMatchSnapshot()
      expect(generateCardSpy).toHaveBeenCalledTimes(3)
    })

    it('should fail if too many duplicates', async () => {
      generateCardSpy.mockReturnValue(Promise.resolve(cardA))
      await expect(cardGenerator.generateCards(2)).resolves.toMatchSnapshot()
    })
  })

  describe('#generateCard', () => {
    let seed: Seed

    beforeEach(() => {
      seed = createSeed('test')
    })

    it('should create a card that matches snapshot', async () => {
      await expect(cardGenerator.generateCard(seed)).resolves.toMatchSnapshot()
    })

    it('should create a card that matches snapshot with no free space', async () => {
      cardGenerator.options.includeFreeSpace = false

      await expect(cardGenerator.generateCard(seed)).resolves.toMatchSnapshot()
    })

    it('should create a card that matches snapshot with different shuffle iteration', async () => {
      cardGenerator.options.shuffleIterations = 10

      await expect(cardGenerator.generateCard(seed)).resolves.toMatchSnapshot()
    })
  })

  describe('#classicMatch', () => {
    let cardA: Card
    let cardB: Card

    beforeEach(() => {
      // prettier-ignore
      cardA = [
        1, 2, 3, 4, 5,
        1, 2, 3, 4, 5,
        1, 2, 3, 4, 5,
        1, 2, 3, 4, 5,
        1, 2, 3, 4, 5
      ]

      cardB = [...cardA] as Card
    })

    it('should return true on identical cards', () => {
      expect(cardGenerator.classicMatch(cardA, cardB)).toBe(true)
    })

    it('should return true with a column match', () => {
      cardB.fill(15, 5, 25)

      expect(cardGenerator.classicMatch(cardA, cardB)).toBe(true)
    })

    it('should return true on row match', () => {
      // prettier-ignore
      cardB = [
        1, 12, 13, 14, 15,
        1, 12, 13, 14, 15,
        1, 12, 13, 14, 15,
        1, 12, 13, 14, 15,
        1, 12, 13, 14, 15
      ]

      expect(cardGenerator.classicMatch(cardA, cardB)).toBe(true)
    })

    it('should return true on right diagonally match', () => {
      // prettier-ignore
      cardB = [
        1, 12, 13, 14, 15,
        11, 2, 13, 14, 15,
        11, 12, 3, 14, 15,
        11, 12, 13, 4, 15,
        11, 12, 13, 14, 5
      ]

      expect(cardGenerator.classicMatch(cardA, cardB)).toBe(true)
    })

    it('should return true on left diagonally match', () => {
      // prettier-ignore
      cardB = [
        11, 12, 13, 14, 5,
        11, 12, 13, 4, 15,
        11, 12, 3, 14, 15,
        11, 2, 13, 14, 15,
        1, 12, 13, 14, 15
      ]

      expect(cardGenerator.classicMatch(cardA, cardB)).toBe(true)
    })

    it('should return false on no match', () => {
      // prettier-ignore
      cardB = [
        11, 12, 13, 14, 15,
        11, 12, 13, 14, 15,
        11, 12, 13, 14, 15,
        11, 12, 13, 14, 15,
        11, 12, 13, 14, 15
      ]

      expect(cardGenerator.classicMatch(cardA, cardB)).toBe(false)
    })
  })
})
