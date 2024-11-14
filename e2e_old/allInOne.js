/* eslint-env detox/detox, jest */
/* globals element by */

import {
  getTourStartElement,
  getTourScheduleElement,
  getTourAuthSelectionElement,
  getTourScheduleMarkId,
  getDoneButton,

  scheduleTourMarks1,
  scheduleTourMarks2,
  scheduleTourMarks3,
  takeScreenshot
} from "./allinOneConstants";

const shouldRun = {
  TourStartScreen: false,
  TourScheduleScreen: false
};

const tourStartTests = () => {
  if (shouldRun.TourStartScreen) {
    it("Is Current Screen", async () => {
      await expect(getTourStartElement()).toBeVisible();
      await takeScreenshot();
    });

    it("Has Skip and Sure buttons", async () => {
      await expect(getTourStartElement("_Skip")).toExist();
      await expect(getTourStartElement("_Sure")).toExist();
    });

    it("Skip button goes to TourAuthSelection", async () => {
      await getTourStartElement("_Skip").tap();
      await expect(getTourAuthSelectionElement()).toExist();
      await takeScreenshot();
    });

    it("Goes from TourAuthSelection back to TourStartScreen", async () => {
      await expect(getTourAuthSelectionElement("_Back")).toExist();
      await getTourAuthSelectionElement("_Back").tap();
      await expect(getTourAuthSelectionElement()).toNotExist();
      await takeScreenshot();
    });

    it("Sure button goes to TourScheduleScreen", async () => {
      await getTourStartElement("_Sure").tap();
      await takeScreenshot();
    });
  } else if (shouldRun.TourScheduleScreen) {
    it("Skip to TourScheduleScreen", async () => {
      await getTourStartElement("_Sure").tap();
    });
  } else {
    it("should have welcome screen", async () => {
      await expect(element(by.id("welcome-test"))).toBeVisible();
    });

    // COMBAK: make work later
    // it('Skip to TourAuthSelection', async () => {
    //   await getTourStartElement('_Skip').tap()
    // })
  }
};

describe.skip("TourScheduleScreen", () => {
  if (shouldRun.TourScheduleScreen) {
    it('Is Current Screen', async () => {
      await expect(getTourScheduleElement()).toBeVisible()
      await takeScreenshot()
    })

    it('Has Tutorial', async () => {
      await expect(getTourScheduleElement('_TutorialBG')).toExist()
      await expect(getTourScheduleElement('_TutorialOK')).toExist()
      await expect(getTourScheduleElement('_Done')).toNotExist()
    })

    it('Has 7 Weekdays', async () => {
      await expect(getTourScheduleElement('_WeekDay_1')).toExist()
      await expect(getTourScheduleElement('_WeekDay_2')).toExist()
      await expect(getTourScheduleElement('_WeekDay_3')).toExist()
      await expect(getTourScheduleElement('_WeekDay_4')).toExist()
      await expect(getTourScheduleElement('_WeekDay_5')).toExist()
      await expect(getTourScheduleElement('_WeekDay_6')).toExist()
      await expect(getTourScheduleElement('_WeekDay_7')).toExist()
    })

    it('Has Toucheable Area', async () => {
      await expect(getTourScheduleElement('_Touchable')).toExist()
    })

    it('Tutorial Dismissed', async () => {
      await getTourScheduleElement('_TutorialOK').tap()
      await expect(getTourScheduleElement('_TutorialBG')).toNotExist()
      await expect(getTourScheduleElement('_TutorialOK')).toNotExist()
      await expect(getTourScheduleElement('_Done')).toExist()
      await takeScreenshot()
    })

    it('Back Button Works', async () => {
      await expect(getTourScheduleElement('Screen')).toExist()
      await expect(getTourScheduleElement('_Back')).toExist()
      await getTourScheduleElement('_Back').tap()
      await takeScreenshot('_1')
      await expect(getTourScheduleElement()).toNotExist()
      await getTourStartElement('_Sure').tap()
      await expect(getTourScheduleElement()).toExist()
      await takeScreenshot('_2')
    })

    it('After hitting back, Tutorial show again', async () => {
      await expect(getTourScheduleElement('_TutorialBG')).toExist()
      await expect(getTourScheduleElement('_TutorialOK')).toExist()
      await expect(getTourScheduleElement('_Done')).toNotExist()
      await takeScreenshot()
    })

    it('Sunday - Create at 12:00AM removing tutorial', async () => {
      const tappable = getTourScheduleElement('_Touchable')

      let location = scheduleTourMarks1[0]
      await tappable.tapAtPoint(location)
      await expect(getTourScheduleMarkId(location)).toExist()
      await expect(getTourScheduleElement('_TutorialBG')).toNotExist()
      await expect(getTourScheduleElement('_TutorialOK')).toNotExist()
      await expect(getTourScheduleElement('_Done')).toExist()
      await takeScreenshot()
    })

    it('Monday - Create at 12:30AM', async () => {
      let location = scheduleTourMarks1[1]
      await getTourScheduleElement('_Touchable').tapAtPoint(location)
      await expect(getTourScheduleMarkId(location)).toExist()
    })

    it('Tuesday - Create at 01:00AM', async () => {
      let location = scheduleTourMarks1[2]
      await getTourScheduleElement('_Touchable').tapAtPoint(location)
      await expect(getTourScheduleMarkId(location)).toExist()
    })

    it('Wednesday - Create at 01:30AM', async () => {
      let location = scheduleTourMarks1[3]
      await getTourScheduleElement('_Touchable').tapAtPoint(location)
      await expect(getTourScheduleMarkId(location)).toExist()
    })

    it('Thursday - Create at 02:00AM', async () => {
      let location = scheduleTourMarks1[4]
      await getTourScheduleElement('_Touchable').tapAtPoint(location)
      await expect(getTourScheduleMarkId(location)).toExist()
    })

    it('Friday - Create at 03:30AM', async () => {
      let location = scheduleTourMarks1[5]
      await getTourScheduleElement('_Touchable').tapAtPoint(location)
      await expect(getTourScheduleMarkId(location)).toExist()
    })

    it('Saturday - Create at 04:00AM', async () => {
      let location = scheduleTourMarks1[6]
      await getTourScheduleElement('_Touchable').tapAtPoint(location)
      await expect(getTourScheduleMarkId(location)).toExist()
    })

    it('Sunday - Creates Mark 2', async () => {
      const location = scheduleTourMarks2[0]
      await getTourScheduleElement('_Touchable').tapAtPoint(location)
      await expect(getTourScheduleMarkId(location)).toExist()
      await takeScreenshot()
    })

    it('Sunday - Creates Mark 3 and unify them', async () => {
      const location1 = scheduleTourMarks1[0]
      const location2 = scheduleTourMarks2[0]
      const location3 = scheduleTourMarks3[0]
      await expect(getTourScheduleMarkId(location1)).toExist()
      await expect(getTourScheduleMarkId(location2)).toExist()
      await expect(getTourScheduleMarkId(location3)).toNotExist()
      await getTourScheduleElement('_Touchable').tapAtPoint(location3) // Unify
      await expect(getTourScheduleMarkId(location1)).toNotExist()
      await expect(getTourScheduleMarkId(location2)).toNotExist()
      await expect(getTourScheduleMarkId(location3)).toNotExist()
      await expect(getTourScheduleMarkId(location1, 45)).toExist()
      await takeScreenshot()
    })

    it('Monday - Displays Menu', async () => {
      const tappable = getTourScheduleElement('_Touchable')
      await tappable.tapAtPoint(scheduleTourMarks1[1])

      await expect(getTourScheduleElement('_Menu')).toExist()
      await expect(getTourScheduleElement('_Menu_15')).toExist()
      await expect(getTourScheduleElement('_Menu_30')).toExist()
      await expect(getTourScheduleElement('_Menu_Custom')).toExist()
      await expect(getTourScheduleElement('_Menu_Input')).toNotExist()
      await expect(getTourScheduleElement('_Menu_Remove')).toExist()
      await expect(getTourScheduleElement('_Done')).toNotExist()
      await takeScreenshot()
    })

    it('Monday - Click outside hides menu', async () => {
      const tappable = getTourScheduleElement('_Touchable')
      await tappable.tapAtPoint(scheduleTourMarks3[6])

      await expect(getTourScheduleElement('_Menu')).toNotExist()
      await expect(getTourScheduleElement('_Menu_15')).toNotExist()
      await expect(getTourScheduleElement('_Menu_30')).toNotExist()
      await expect(getTourScheduleElement('_Menu_Custom')).toNotExist()
      await expect(getTourScheduleElement('_Menu_Remove')).toNotExist()
      await expect(getTourScheduleElement('_Done')).toExist()
      await takeScreenshot()
    })

    it('Tuesday - Remove', async () => {
      const tappable = getTourScheduleElement('_Touchable')
      const removeTappable = getTourScheduleElement('_Menu_Remove')
      let location = scheduleTourMarks1[2]

      await tappable.tapAtPoint(location)
      await removeTappable.tap()
      await expect(getTourScheduleMarkId(location)).toNotExist()
      await takeScreenshot()
    })

    it('Tuesday - Marker at bottom have menu well placed', async () => {
      const tappable = getTourScheduleElement('_Touchable')
      let location = { x: 100, y: 500 }
      await tappable.tapAtPoint(location) // Add Marker
      await takeScreenshot('_1')
      await expect(getTourScheduleMarkId(location)).toExist()
      await tappable.tapAtPoint(location) // Open Menu
      await expect(getTourScheduleElement('_Menu')).toExist()
      await takeScreenshot('_2')
    })

    it('Tuesday - Showing keyboard keep well placed', async () => {
      // Menu still open from previous test!
      const tappable = getTourScheduleElement('_Touchable')
      await expect(getTourScheduleElement('_Menu_Custom')).toExist()
      await getTourScheduleElement('_Menu_Custom').tap()
      await takeScreenshot()
      await tappable.tapAtPoint({x: 300, y: 300}) // Dismiss Menu
    })

    it('Tuesday - Trying to scroll will hide menu but not scroll', async () => {
      const tappable = getTourScheduleElement('_Touchable')
      let location = { x: 100, y: 500 }
      await tappable.tapAtPoint(location) // Open menu
      await takeScreenshot(`_1`)
      const scrollable = getTourScheduleElement('_ScrollView')
      await expect(scrollable).toExist()
      await scrollable.scroll(200, 'down')
      await expect(getTourScheduleElement('_Menu')).toNotExist()
      await takeScreenshot(`_2`)
    })

    it('Tuesday - After scroll menu is well placed', async () => {
      await getTourScheduleElement('_ScrollView').scroll(200, 'down')
      await takeScreenshot(`_1`)
      let location = { x: 100, y: 500 }
      await getTourScheduleElement('_Touchable').tapAtPoint(location)
      await expect(getTourScheduleElement('_Menu')).toExist()
      await takeScreenshot(`_2`)
    })

    it('Tuesday - Showing keyboard keep well placed 2', async () => {
      // Menu still open from previous test!
      const tappable = getTourScheduleElement('_Touchable')
      await expect(getTourScheduleElement('_Menu_Custom')).toExist()
      await getTourScheduleElement('_Menu_Custom').tap()
      await takeScreenshot()
      await tappable.tapAtPoint({x: 300, y: 300}) // Dismiss Menu
    })

    it('Wednesday - Scroll top and remove', async () => {
      const tappable = getTourScheduleElement('_Touchable')
      const scrollable = getTourScheduleElement('_ScrollView')
      let location = scheduleTourMarks1[3]
      await scrollable.scrollTo('top')
      await takeScreenshot(`_1`)
      await tappable.tapAtPoint(location)
      await getTourScheduleElement('_Menu_Remove').tap()
      await expect(getTourScheduleMarkId(location)).toNotExist()
      await takeScreenshot(`_2`)
    })

    it('Wednesday - Scroll bottom and create', async () => {
      const tappable = getTourScheduleElement('_Touchable')
      const scrollable = getTourScheduleElement('_ScrollView')
      await scrollable.scrollTo('bottom')
      await takeScreenshot(`_1`)
      await tappable.tapAtPoint({ x: 150, y: 1300 })
      await takeScreenshot(`_2`)
      //      await tappable.tapAtPoint({x: 10, y: 1200}) // Dismiss Menu
    })

    it('Wednesday - Check menu again', async () => {
      const tappable = getTourScheduleElement('_Touchable')
      await tappable.tapAtPoint({ x: 150, y: 1300 })
      await takeScreenshot(`_1`)
      await getTourScheduleElement('_Menu_Custom').tap()
      await takeScreenshot(`_2`)
      await tappable.tapAtPoint({x: 10, y: 1200}) // Dismiss Menu
      await takeScreenshot(`_3`)
    })

    it('Wednesday - Scroll up a bit and check menu again', async () => {
      const tappable = getTourScheduleElement('_Touchable')
      const scrollable = getTourScheduleElement('_ScrollView')
      await scrollable.scroll(200, 'up')
      await takeScreenshot(`_1`)
      await tappable.tapAtPoint({ x: 150, y: 1300 })
      await takeScreenshot(`_2`)
      await getTourScheduleElement('_Menu_Custom').tap()
      await takeScreenshot(`_3`)
      await tappable.tapAtPoint({x: 10, y: 1200}) // Dismiss Menu
    })

    it('Thursday - Scroll up set 32 minutes then 99 minutes', async () => {
      const tappable = getTourScheduleElement('_Touchable')
      const scrollable = getTourScheduleElement('_ScrollView')
      let location = scheduleTourMarks1[4]
      await scrollable.scrollTo('top')
      await takeScreenshot(`_1`)
      await tappable.tapAtPoint(location)
      await getTourScheduleElement('_Menu_Custom').tap()
      await getTourScheduleElement('_Menu_Input').typeText('32')
      await getDoneButton().tap()
      await expect(getTourScheduleMarkId(location, 32)).toExist()
      await tappable.tapAtPoint(location)
      await getTourScheduleElement('_Menu_Custom').tap()
      await getTourScheduleElement('_Menu_Input').typeText('99')
      await getDoneButton().tap()
      await expect(getTourScheduleMarkId(location, 99)).toExist()
    })

    it('Friday - Set 30 minutes then 15 minutes', async () => {
      const tappable = getTourScheduleElement('_Touchable')
      let location = scheduleTourMarks1[5]
      await takeScreenshot(`_1`)
      await tappable.tapAtPoint(location)
      await getTourScheduleElement('_Menu_30').tap()
      await expect(getTourScheduleMarkId(location, 30)).toExist()
      await takeScreenshot(`_2`)
      await tappable.tapAtPoint(location)
      await getTourScheduleElement('_Menu_15').tap()
      await expect(getTourScheduleMarkId(location, 15)).toExist()
      await takeScreenshot(`_3`)
    })

    it('Saturday - Set empty, set 0, set 1, stay 15, then delete', async () => {
      const tappable = getTourScheduleElement('_Touchable')
      let location = scheduleTourMarks1[6]
      await takeScreenshot(`_1`)
      await tappable.tapAtPoint(location)
      await getTourScheduleElement('_Menu_Custom').tap()
      await getDoneButton().tap()
      await expect(getTourScheduleMarkId(location, 15)).toExist()
      await takeScreenshot(`_2`)
      await tappable.tapAtPoint(location)
      await getTourScheduleElement('_Menu_Custom').tap()
      await getTourScheduleElement('_Menu_Input').typeText('0')
      await getDoneButton().tap()
      await expect(getTourScheduleMarkId(location, 15)).toExist()
      await takeScreenshot(`_2`)
      await tappable.tapAtPoint(location)
      await getTourScheduleElement('_Menu_Remove').tap()
    })

    it('Goes to Baby Age Selection', async () => {
      await getTourScheduleElement('_Done').tap()
    })
  }
});

export { tourStartTests as default };
