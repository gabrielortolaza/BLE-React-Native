import React from 'react'
import { shallow } from 'enzyme'

import ModalAchievementScreen, { getAchievementImage } from '../../../src/Components/ModalAchievementScreen'

describe('ModalAchievementScreen', () => {
  it('Empty 1', () => {
    const wrapper = shallow(
      <ModalAchievementScreen />)

    expect(wrapper.isEmptyRender()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  it('Empty 2', () => {
    const wrapper = shallow(
      <ModalAchievementScreen achievement={{ key: 'someKey' }} />)

    expect(wrapper.isEmptyRender()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  it('Empty 3', () => {
    const wrapper = shallow(
      <ModalAchievementScreen achievement={{ texts: {} }} />)

    expect(wrapper.isEmptyRender()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  it('Structure - Button', () => {
    const achievementDisplayed = jest.fn()
    const key = 'badge_1'
    const achievement = {
      key,
      texts: {
        title1: `Title1`,
        subtitle: `Subtitle`,
        description: `Description`
      }
    }
    const wrapper = shallow(
      <ModalAchievementScreen
        achievement={achievement}
        achievementDisplayed={achievementDisplayed}
      />)
    const render = wrapper.dive()

    expect(wrapper.isEmptyRender()).toBeFalsy()

    const okButton = render.find('RoundButton')
    expect(okButton).toHaveLength(1)

    expect(achievementDisplayed.mock.calls).toHaveLength(0)
    okButton.simulate('press')
    expect(achievementDisplayed.mock.calls).toHaveLength(1)

    expect(render).toMatchSnapshot()
  })

  it('Structure - Default', () => {
    const achievementDisplayed = jest.fn()
    const key = 'badge_1'
    const achievement = {
      key,
      texts: {
        title1: `Title1`,
        subtitle: `Subtitle`,
        description: `Description`
      }
    }
    const wrapper = shallow(
      <ModalAchievementScreen
        achievement={achievement}
        achievementDisplayed={achievementDisplayed}
      />)
    const render = wrapper.dive()

    // Base
    expect(wrapper.isEmptyRender()).toBeFalsy()
    expect(render.find({ testID: 'AchievementScreen' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_Gradient' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_Image' })).toHaveLength(1)
    expect(render.find('RoundButton')).toHaveLength(1)

    // Default Layout
    expect(render.find({ testID: 'AchievementScreen_Lottie' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_Top' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_TopTitle' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_TopSubtitle' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_CenterImage' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_Footer' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_Description' })).toHaveLength(1)

    // Alt Layout
    expect(render.find({ testID: 'AchievementScreen_LottieAlt' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_AltTitle' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_AltImage' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_Bottom' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_BottomTitle' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_BottomSubtitle' })).toHaveLength(0)

    // Center Layout
    expect(render.find({ testID: 'AchievementScreen_TopTitleCenter' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_FooterCenter' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_DescriptionCenter' })).toHaveLength(0)

    expect(render).toMatchSnapshot()
  })

  it('Structure - altLayout', () => {
    const achievementDisplayed = jest.fn()
    const key = 'badge_1'
    const achievement = {
      key,
      texts: {
        title1: `Title1`,
        subtitle: `Subtitle`,
        description: `Description`,
        altLayout: true
      }
    }
    const wrapper = shallow(
      <ModalAchievementScreen
        achievement={achievement}
        achievementDisplayed={achievementDisplayed}
      />)
    const render = wrapper.dive()

    // Base
    expect(wrapper.isEmptyRender()).toBeFalsy()
    expect(render.find({ testID: 'AchievementScreen' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_Gradient' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_Image' })).toHaveLength(1)
    expect(render.find('RoundButton')).toHaveLength(1)

    // Default Layout
    expect(render.find({ testID: 'AchievementScreen_Lottie' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_Top' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_TopTitle' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_TopSubtitle' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_CenterImage' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_Footer' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_Description' })).toHaveLength(1)

    // Alt Layout
    expect(render.find({ testID: 'AchievementScreen_LottieAlt' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_AltTitle' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_AltImage' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_Bottom' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_BottomTitle' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_BottomSubtitle' })).toHaveLength(1)

    // Center Layout
    expect(render.find({ testID: 'AchievementScreen_TopTitleCenter' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_FooterCenter' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_DescriptionCenter' })).toHaveLength(0)

    expect(render).toMatchSnapshot()
  })

  it('Structure - allCenter', () => {
    const achievementDisplayed = jest.fn()
    const key = 'badge_1'
    const achievement = {
      key,
      texts: {
        title1: `Title1`,
        subtitle: `Subtitle`,
        description: `Description`,
        allCenter: true
      }
    }
    const wrapper = shallow(
      <ModalAchievementScreen
        achievement={achievement}
        achievementDisplayed={achievementDisplayed}
      />)
    const render = wrapper.dive()

    // Base
    expect(wrapper.isEmptyRender()).toBeFalsy()
    expect(render.find({ testID: 'AchievementScreen' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_Gradient' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_Image' })).toHaveLength(1)
    expect(render.find('RoundButton')).toHaveLength(1)

    // Default Layout
    expect(render.find({ testID: 'AchievementScreen_Lottie' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_Top' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_TopTitle' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_TopSubtitle' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_CenterImage' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_Footer' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_Description' })).toHaveLength(0)

    // Alt Layout
    expect(render.find({ testID: 'AchievementScreen_LottieAlt' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_AltTitle' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_AltImage' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_Bottom' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_BottomTitle' })).toHaveLength(0)
    expect(render.find({ testID: 'AchievementScreen_BottomSubtitle' })).toHaveLength(0)

    // Center Layout
    expect(render.find({ testID: 'AchievementScreen_TopTitleCenter' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_FooterCenter' })).toHaveLength(1)
    expect(render.find({ testID: 'AchievementScreen_DescriptionCenter' })).toHaveLength(1)

    expect(render).toMatchSnapshot()
  })

  it('Contents - Default', () => {
    const achievementDisplayed = jest.fn()
    const key = 'badge_1'
    const achievement = {
      key,
      texts: {
        title1: `Title1`,
        subtitle: `Subtitle`,
        description: `Description`
      }
    }
    const wrapper = shallow(
      <ModalAchievementScreen
        achievement={achievement}
        achievementDisplayed={achievementDisplayed}
      />
    )

    expect(wrapper.find({ testID: 'AchievementScreen_TopTitle' }).render().text()).toBe(achievement.texts.title1)
    expect(wrapper.find({ testID: 'AchievementScreen_TopSubtitle' }).render().text()).toBe(achievement.texts.subtitle)
    expect(wrapper.find({ testID: 'AchievementScreen_Description' }).render().text()).toBe(achievement.texts.description)
  })

  it('Contents - altLayout', () => {
    const achievementDisplayed = jest.fn()
    const key = 'badge_1'
    const achievement = {
      key,
      texts: {
        title1: `Title1`,
        title2: `Title2`,
        subtitle: `Subtitle`,
        description: `Description`,
        altLayout: true
      }
    }
    const wrapper = shallow(
      <ModalAchievementScreen
        achievement={achievement}
        achievementDisplayed={achievementDisplayed}
      />)

    // Alt Layout
    expect(wrapper.find({ testID: 'AchievementScreen_AltTitle' }).render().text()).toBe(achievement.texts.title1)
    expect(wrapper.find({ testID: 'AchievementScreen_BottomTitle' }).render().text()).toBe(achievement.texts.title2)
    expect(wrapper.find({ testID: 'AchievementScreen_BottomSubtitle' }).render().text()).toBe(achievement.texts.subtitle)
    expect(wrapper.find({ testID: 'AchievementScreen_Description' }).render().text()).toBe(achievement.texts.description)
  })

  it('Contents - allCenter', () => {
    const achievementDisplayed = jest.fn()
    const key = 'badge_1'
    const achievement = {
      key,
      texts: {
        title1: `Title1`,
        subtitle: `Subtitle`,
        description: `Description`,
        allCenter: true
      }
    }
    const wrapper = shallow(
      <ModalAchievementScreen
        achievement={achievement}
        achievementDisplayed={achievementDisplayed}
      />)

    expect(wrapper.find({ testID: 'AchievementScreen_TopTitleCenter' }).render().text()).toBe(achievement.texts.title1)
    expect(wrapper.find({ testID: 'AchievementScreen_DescriptionCenter' }).render().text()).toBe(achievement.texts.description)
  })

  it('Badge 1', () => {
    const achievementDisplayed = jest.fn()
    const key = 'badge_1'
    const achievement = {
      key,
      texts: {
        title1: `Title1`,
        subtitle: `Subtitle`,
        description: `Description`
      }
    }
    const wrapper = shallow(
      <ModalAchievementScreen
        achievement={achievement}
        achievementDisplayed={achievementDisplayed}
      />)
    const render = wrapper.dive()
    const image = render.find({ testID: 'AchievementScreen_Image' })
    expect(image).toHaveLength(1)
    const sourceProp = image.prop('source')

    const badge = getAchievementImage('badge_1')
    const badgeAge = getAchievementImage('age_1')
    const badgeStreak = getAchievementImage('streak_1')
    const badgeVolume = getAchievementImage('volume_1')

    expect(sourceProp.testUri).toBe(badge.testUri)
    expect(badgeAge.testUri).toBe(badge.testUri)
    expect(badgeStreak.testUri).toBe(badge.testUri)
    expect(badgeVolume.testUri).toBe(badge.testUri)
  })

  it('Badge 2', () => {
    const achievementDisplayed = jest.fn()
    const key = 'badge_2'
    const achievement = {
      key,
      texts: {
        title1: `Title1`,
        subtitle: `Subtitle`,
        description: `Description`
      }
    }
    const wrapper = shallow(
      <ModalAchievementScreen
        achievement={achievement}
        achievementDisplayed={achievementDisplayed}
      />)
    const render = wrapper.dive()
    const image = render.find({ testID: 'AchievementScreen_Image' })
    expect(image).toHaveLength(1)
    const sourceProp = image.prop('source')

    const badge = getAchievementImage('badge_2')
    const badgeAge = getAchievementImage('age_2')
    const badgeStreak = getAchievementImage('streak_2')
    const badgeVolume2 = getAchievementImage('volume_2')
    const badgeVolume3 = getAchievementImage('volume_3')

    expect(sourceProp.testUri).toBe(badge.testUri)
    expect(badgeAge.testUri).toBe(badge.testUri)
    expect(badgeStreak.testUri).toBe(badge.testUri)
    expect(badgeVolume2.testUri).toBe(badge.testUri)
    expect(badgeVolume3.testUri).toBe(badge.testUri)
  })

  it('Badge 3', () => {
    const achievementDisplayed = jest.fn()
    const key = 'badge_3'
    const achievement = {
      key,
      texts: {
        title1: `Title1`,
        subtitle: `Subtitle`,
        description: `Description`
      }
    }
    const wrapper = shallow(
      <ModalAchievementScreen
        achievement={achievement}
        achievementDisplayed={achievementDisplayed}
      />)
    const render = wrapper.dive()
    const image = render.find({ testID: 'AchievementScreen_Image' })
    expect(image).toHaveLength(1)
    const sourceProp = image.prop('source')

    const badge = getAchievementImage('badge_3')
    const badgeAge = getAchievementImage('age_3')

    expect(sourceProp.testUri).toBe(badge.testUri)
    expect(badgeAge.testUri).toBe(badge.testUri)
  })

  it('Badge 4', () => {
    const achievementDisplayed = jest.fn()
    const key = 'badge_4'
    const achievement = {
      key,
      texts: {
        title1: `Title1`,
        subtitle: `Subtitle`,
        description: `Description`
      }
    }
    const wrapper = shallow(
      <ModalAchievementScreen
        achievement={achievement}
        achievementDisplayed={achievementDisplayed}
      />)
    const render = wrapper.dive()
    const image = render.find({ testID: 'AchievementScreen_Image' })
    expect(image).toHaveLength(1)
    const sourceProp = image.prop('source')

    const badge = getAchievementImage('badge_4')
    const badgeAge = getAchievementImage('age_4')

    expect(sourceProp.testUri).toBe(badge.testUri)
    expect(badgeAge.testUri).toBe(badge.testUri)
  })

  it('Badge 5', () => {
    const achievementDisplayed = jest.fn()
    const key = 'badge_5'
    const achievement = {
      key,
      texts: {
        title1: `Title1`,
        subtitle: `Subtitle`,
        description: `Description`
      }
    }
    const wrapper = shallow(
      <ModalAchievementScreen
        achievement={achievement}
        achievementDisplayed={achievementDisplayed}
      />)
    const render = wrapper.dive()
    const image = render.find({ testID: 'AchievementScreen_Image' })
    expect(image).toHaveLength(1)
    const sourceProp = image.prop('source')

    const badge = getAchievementImage('badge_5')
    const badgeAge = getAchievementImage('age_5')

    expect(sourceProp.testUri).toBe(badge.testUri)
    expect(badgeAge.testUri).toBe(badge.testUri)
  })
})
