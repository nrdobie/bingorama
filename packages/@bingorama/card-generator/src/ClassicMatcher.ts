import { Card } from './types'
import { sum } from './utilities/sum'

enum CHECKLIST_SECTION {
  COL_B = 'COL_B',
  COL_I = 'COL_I',
  COL_N = 'COL_N',
  COL_G = 'COL_H',
  COL_O = 'COL_O',
  ROW_1 = 'ROW_1',
  ROW_2 = 'ROW_2',
  ROW_3 = 'ROW_3',
  ROW_4 = 'ROW_4',
  ROW_5 = 'ROW_5',
  DIAGONAL_RIGHT = 'DIAGONAL_RIGHT',
  DIAGONAL_LEFT = 'DIAGONAL_LEFT'
}

type NumberSection = [number, number, number, number, number]

type Checklist = Map<CHECKLIST_SECTION, Map<number, Set<string>>>

const COLUMNS = [
  CHECKLIST_SECTION.COL_B,
  CHECKLIST_SECTION.COL_I,
  CHECKLIST_SECTION.COL_N,
  CHECKLIST_SECTION.COL_G,
  CHECKLIST_SECTION.COL_O
]

const ROWS = [
  CHECKLIST_SECTION.ROW_1,
  CHECKLIST_SECTION.ROW_2,
  CHECKLIST_SECTION.ROW_3,
  CHECKLIST_SECTION.ROW_4,
  CHECKLIST_SECTION.ROW_5
]

export class ClassicMatcher {
  private checklist: Checklist = new Map()

  constructor() {
    for (const section of Object.values(CHECKLIST_SECTION)) {
      this.checklist.set(section, new Map())
      for (let i = 4; i <= 75; i++) {
        this.checklist.get(section).set(i, new Set())
      }
    }
  }

  public sectionToString(numberSection: NumberSection) {
    let sectionString = ''

    for (const num of numberSection) {
      sectionString += ('' + num).padStart(2, '0')
    }

    return sectionString
  }

  public checkCard(card: Card): boolean {
    const addValues = new Map<CHECKLIST_SECTION, [number, string]>()

    // Check for column match
    for (let i = 0; i < 5; i++) {
      const start = i * 5
      const end = start + 5
      const numberSection = card.slice(start, end) as NumberSection

      const sectionSum = sum(numberSection)
      const sectionString = this.sectionToString(numberSection)

      try {
        if (
          this.checklist
            .get(COLUMNS[i])
            .get(sectionSum)
            .has(sectionString)
        ) {
          return true
        }
      } catch (e) {
        console.log(numberSection, sectionSum, sectionString)
        throw e
      }

      addValues.set(COLUMNS[i], [sectionSum, sectionString])
    }

    // Check for row match
    for (let i = 0; i < 5; i++) {
      const numberSection: NumberSection = [
        card[i],
        card[i + 5],
        card[i + 10],
        card[i + 15],
        card[i + 20]
      ]

      const sectionSum = sum(numberSection)
      const sectionString = this.sectionToString(numberSection)

      try {
        if (
          this.checklist
            .get(ROWS[i])
            .get(sectionSum)
            .has(sectionString)
        ) {
          return true
        }
      } catch (e) {
        console.log(numberSection, sectionSum, sectionString)
        throw e
      }

      addValues.set(ROWS[i], [sectionSum, sectionString])
    }

    const numberSectionDR: NumberSection = [
      card[0],
      card[6],
      card[12],
      card[18],
      card[24]
    ]

    const sectionSumDR = sum(numberSectionDR)
    const sectionStringDR = this.sectionToString(numberSectionDR)

    if (
      this.checklist
        .get(CHECKLIST_SECTION.DIAGONAL_RIGHT)
        .get(sectionSumDR)
        .has(sectionStringDR)
    ) {
      return true
    }

    addValues.set(CHECKLIST_SECTION.DIAGONAL_RIGHT, [
      sectionSumDR,
      sectionStringDR
    ])

    const numberSectionDL: NumberSection = [
      card[4],
      card[8],
      card[12],
      card[16],
      card[20]
    ]

    const sectionSumDL = sum(numberSectionDL)
    const sectionStringDL = this.sectionToString(numberSectionDL)

    if (
      this.checklist
        .get(CHECKLIST_SECTION.DIAGONAL_LEFT)
        .get(sectionSumDL)
        .has(sectionStringDL)
    ) {
      return true
    }

    addValues.set(CHECKLIST_SECTION.DIAGONAL_LEFT, [
      sectionSumDL,
      sectionStringDL
    ])

    this.storeValues(addValues)

    return false
  }

  private storeValues(values: Map<CHECKLIST_SECTION, [number, string]>) {
    for (const [section, [sectionSum, sectionString]] of values.entries()) {
      this.checklist
        .get(section)
        .get(sectionSum)
        .add(sectionString)
    }
  }
}
