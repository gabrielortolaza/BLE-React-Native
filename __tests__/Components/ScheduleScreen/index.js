import React from 'react'
import { shallow } from 'enzyme'

const ScheduleScreen = require('../../../src/Components/ScheduleScreen').default

export const getTourScheduleElement = (append = 'Screen') => {
  return { testID: `Schedule${append}` }
}

describe('ScheduleScreen', () => {
  it('Default', () => {
    const events = {}
    const save = jest.fn()
    const onDone = jest.fn()
    const goBack = jest.fn()

    const wrapper = shallow(<ScheduleScreen
      events={events}
      save={save}
      onDone={onDone}
      goBack={goBack}
    />)
    let render = wrapper.dive()

    expect(render.find(getTourScheduleElement())).toHaveLength(1)
    expect(render.find(getTourScheduleElement('_ScrollView'))).toHaveLength(1)
    expect(render.find(getTourScheduleElement('_Done'))).toHaveLength(0)
    expect(render).toMatchSnapshot()

    // Back Button
    expect(goBack.mock.calls).toHaveLength(0)
    expect(render.find(getTourScheduleElement('_Back'))).toHaveLength(1)
    render.find(getTourScheduleElement('_Back')).simulate('press')
    expect(goBack.mock.calls).toHaveLength(1)

    // Week Days
    const wrapperWeekDay = render.find('WeekDays')
    expect(wrapperWeekDay).toHaveLength(1)
    const renderWeekDay = wrapperWeekDay.dive()
    expect(renderWeekDay.find(getTourScheduleElement('_WeekDay_1'))).toHaveLength(1)
    expect(renderWeekDay.find(getTourScheduleElement('_WeekDay_2'))).toHaveLength(1)
    expect(renderWeekDay.find(getTourScheduleElement('_WeekDay_3'))).toHaveLength(1)
    expect(renderWeekDay.find(getTourScheduleElement('_WeekDay_4'))).toHaveLength(1)
    expect(renderWeekDay.find(getTourScheduleElement('_WeekDay_5'))).toHaveLength(1)
    expect(renderWeekDay.find(getTourScheduleElement('_WeekDay_6'))).toHaveLength(1)
    expect(renderWeekDay.find(getTourScheduleElement('_WeekDay_7'))).toHaveLength(1)
    expect(renderWeekDay).toMatchSnapshot()

    // Tutorial
    const wrapperTutorial = render.find('Tutorial')
    expect(wrapperTutorial).toHaveLength(1)
    const renderTutorial = wrapperTutorial.dive()
    expect(renderTutorial.find(getTourScheduleElement('_TutorialBG'))).toHaveLength(1)
    const renderTutorialOk = renderTutorial.find(getTourScheduleElement('_TutorialOK'))
    expect(renderTutorialOk).toHaveLength(1)
    expect(renderTutorial).toMatchSnapshot()
    renderTutorialOk.simulate('press')
    wrapper.update()
    render = wrapper.dive()

    expect(render.find('Tutorial')).toHaveLength(0)
    expect(render.find(getTourScheduleElement('_Done'))).toHaveLength(1)
    expect(render).toMatchSnapshot()

    // Touchable
    const wrapperTouchable = render.find('Touchable')
    expect(wrapperTouchable).toHaveLength(1)
    const renderTouchable = wrapperTouchable.dive()
    expect(renderTouchable.find(getTourScheduleElement('_Touchable'))).toHaveLength(1)
    expect(renderTouchable).toMatchSnapshot()

    expect(render).toMatchSnapshot()
  })
/*
  it('Default Alt', () => {
    expect(shallow(<ScheduleScreen alt />).dive()).toMatchSnapshot()
  }) */
})

/*
events: toJS(store.schedule.events || {}),
save: store.schedule.save,
onDone: store.nav.currentRoute === 'PumpSchedule' ? store.nav.back : store.nav.goNextTour,
goBack: store.nav.back,
alt: store.nav.currentRoute !== 'PumpSchedule'
*/
