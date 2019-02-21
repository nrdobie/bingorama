import { Bar } from 'cli-progress'
import { performance } from 'perf_hooks'
import { CardGenerator, CardGeneratorWithCM } from './index'
import { sum } from './utilities/sum'

const seed = 'nick rules'
const totalSets = [100, 1_000, 2_500, 5_000, 10_000, 15_000]
const runCount = 50

async function run() {
  const classicStats = new Map<number, Map<number, number>>()
  const enhancedStats = new Map<number, Map<number, number>>()

  for (const total of totalSets) {
    console.log('%d card generation', total)

    const bar = new Bar({
      format:
        '{type} {run} of {total_runs} | [{bar}] {percentage}% {value}/{total}'
    })

    classicStats.set(total, new Map())
    enhancedStats.set(total, new Map())
    bar.start(total, 0)

    for (let i = 1; i <= runCount; i++) {
      // classic
      const cm = new CardGenerator({ seed, shuffleIterations: 40 })

      const cmRunStart = performance.now()
      await cm.generateCards(total, g =>
        bar.update(g, {
          type: 'CLASSIC ',
          run: i,
          total_runs: runCount
        })
      )
      const cmRunDuration = performance.now() - cmRunStart

      classicStats.get(total).set(i, cmRunDuration)

      // enhanced
      const em = new CardGeneratorWithCM({ seed, shuffleIterations: 40 })

      const emRunStart = performance.now()
      await em.generateCards(total, g =>
        bar.update(g, {
          type: 'ENHANCED',
          run: i,
          total_runs: runCount
        })
      )
      const emRunDuration = performance.now() - emRunStart

      enhancedStats.get(total).set(i, emRunDuration)
    }

    bar.stop()

    console.log('\nStats:')
    console.log('Classic ', ...processRawStats(total, classicStats.get(total)))
    console.log('Enhanced', ...processRawStats(total, enhancedStats.get(total)))
    console.log('\n-----------\n\n')
  }

  console.log('\n\nFinal Stats\n')

  for (const total of totalSets) {
    console.log('\n%s Stats:', total)
    console.log('Classic ', ...processRawStats(total, classicStats.get(total)))
    console.log('Enhanced', ...processRawStats(total, enhancedStats.get(total)))
  }

  console.log('\n')
}

run()

function processRawStats(total: number, statSet: Map<number, number>) {
  const rawValues = Array.from(statSet.values())

  const totalTimeAvg = sum(rawValues) / rawValues.length

  const cardTimeAvg = Math.round((totalTimeAvg / total) * 1_000) / 1_000

  return [millisecondsToTime(Math.round(totalTimeAvg)), cardTimeAvg]
}

function millisecondsToTime(milli) {
  const milliseconds = milli % 1000
  const seconds = Math.floor((milli / 1000) % 60)
  const minutes = Math.floor((milli / (60 * 1000)) % 60)

  return minutes + ':' + seconds + '.' + milliseconds
}
