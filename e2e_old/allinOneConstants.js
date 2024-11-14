/* eslint-env detox/detox, jest */
/* globals element by */

import jestExpect from 'expect'
import os from 'os'

const util = require('util')
const fs = require('fs')
const exec = util.promisify(require('child_process').exec)

export const ScheduleMarkWidth = 45
export const ScheduleMarkHeight = 18
export const scheduleTourMarks1 = []
scheduleTourMarks1.push({x: (ScheduleMarkWidth * 1) - 1, y: (ScheduleMarkHeight * 1) - 1})
scheduleTourMarks1.push({x: (ScheduleMarkWidth * 2) - 5, y: (ScheduleMarkHeight * 3) - 3})
scheduleTourMarks1.push({x: (ScheduleMarkWidth * 3) - 10, y: (ScheduleMarkHeight * 5) - 6})
scheduleTourMarks1.push({x: (ScheduleMarkWidth * 4) - 20, y: (ScheduleMarkHeight * 7) - 9})
scheduleTourMarks1.push({x: (ScheduleMarkWidth * 5) - 30, y: (ScheduleMarkHeight * 9) - 12})
scheduleTourMarks1.push({x: (ScheduleMarkWidth * 6) - 40, y: (ScheduleMarkHeight * 11) - 15})
scheduleTourMarks1.push({x: (ScheduleMarkWidth * 7) - 45, y: (ScheduleMarkHeight * 13) - 18})

export const scheduleTourMarks2 = []
scheduleTourMarks2.push({x: (ScheduleMarkWidth * 1) - 1, y: (ScheduleMarkHeight * 3) - 1})
scheduleTourMarks2.push({x: (ScheduleMarkWidth * 2) - 5, y: (ScheduleMarkHeight * 4) - 3})
scheduleTourMarks2.push({x: (ScheduleMarkWidth * 3) - 10, y: (ScheduleMarkHeight * 5) - 6})
scheduleTourMarks2.push({x: (ScheduleMarkWidth * 4) - 20, y: (ScheduleMarkHeight * 6) - 9})
scheduleTourMarks2.push({x: (ScheduleMarkWidth * 5) - 30, y: (ScheduleMarkHeight * 7) - 12})
scheduleTourMarks2.push({x: (ScheduleMarkWidth * 6) - 40, y: (ScheduleMarkHeight * 8) - 15})
scheduleTourMarks2.push({x: (ScheduleMarkWidth * 7) - 45, y: (ScheduleMarkHeight * 9) - 18})

export const scheduleTourMarks3 = []
scheduleTourMarks3.push({x: (ScheduleMarkWidth * 1) - 1, y: (ScheduleMarkHeight * 2) - 1})
scheduleTourMarks3.push({x: (ScheduleMarkWidth * 2) - 5, y: (ScheduleMarkHeight * 3) - 3})
scheduleTourMarks3.push({x: (ScheduleMarkWidth * 3) - 10, y: (ScheduleMarkHeight * 4) - 6})
scheduleTourMarks3.push({x: (ScheduleMarkWidth * 4) - 20, y: (ScheduleMarkHeight * 5) - 9})
scheduleTourMarks3.push({x: (ScheduleMarkWidth * 5) - 30, y: (ScheduleMarkHeight * 6) - 12})
scheduleTourMarks3.push({x: (ScheduleMarkWidth * 6) - 40, y: (ScheduleMarkHeight * 7) - 15})
scheduleTourMarks3.push({x: (ScheduleMarkWidth * 7) - 45, y: (ScheduleMarkHeight * 8) - 18})

export const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))

export const getTourStartElement = (append = 'Screen') => element(by.id(`TourStart${append}`))
export const getTourScheduleElement = (append = 'Screen') => element(by.id(`Schedule${append}`))
export const getTourScheduleMarkId = (location, duration = 15) => getTourScheduleElement(`_MK_${location.x}_${location.y}_${duration}`)
export const getTourAuthSelectionElement = (append = 'Screen') => element(by.id(`TourAuthSelection${append}`))

export const getDoneButton = () => element(by.type('UIButtonLabel').and(by.label('Done')))

export const takeScreenshot = async (name) => {
  /*
  const jestGlobal = global[Symbol.for('$$jest-matchers-object')]
  if (jestGlobal && jestGlobal.state && jestGlobal.state.currentTestName) {
    const nameParts = jestGlobal.state.currentTestName.split(' ')
    const screenshotName = `${nameParts.shift()}-${nameParts.join('_')}`
    const screenshotPath = `${SCREENSHOT_DIR}/${screenshotName}${name ? `-` + name : ''}[NEW].png`
    const command = `xcrun simctl io booted screenshot ${screenshotPath}`
    const { stderr } = await exec(command)
    if (!stderr || stderr.indexOf(`Wrote screenshot to: ${screenshotPath}`) === -1) {
      throw new Error(stderr)
    }
    const image = fs.readFileSync(screenshotPath)
    jestExpect(image).toMatchImageSnapshot(image)
  }
  */
  /*
  const screenshotPath = `${os.tmpdir()}/${Date.now()}.png`
  const command = `xcrun simctl io booted screenshot ${screenshotPath}`
  const { stderr } = await exec(command)
  if (!stderr || stderr.indexOf(`Wrote screenshot to: ${screenshotPath}`) === -1) {
    throw new Error(stderr)
  }
  const image = fs.readFileSync(screenshotPath)
  jestExpect(image).toMatchImageSnapshot(image)
  */
  return true
}
