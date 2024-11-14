import React from 'react'
import PropTypes from 'prop-types'
import renderer from 'react-test-renderer'

const TabAccountScreen = require('../../../src/Components/TabAccountScreen').default

describe('TabAccountScreen', () => {
  it('Default', () => {
    expect(renderer.create(
      <TabAccountScreen
        profile={{displayName: 'Jane Doe'}}
        updateProfile={() => {}}
        signOut={() => {}}
        navGo={() => {}} />).toJSON()).toMatchSnapshot()
  })

  it('Facebook Login', () => {
    expect(renderer.create(
      <TabAccountScreen
        profile={{displayName: 'Jane Doe', isFacebookLogin: true}}
        updateProfile={() => {}}
        signOut={() => {}}
        navGo={() => {}} />).toJSON()).toMatchSnapshot()
  })

  it('Has Fitbit', () => {
    expect(renderer.create(
      <TabAccountScreen
        profile={{displayName: 'Jane Doe', isFacebookLogin: false, fitbit: {}}}
        updateProfile={() => {}}
        signOut={() => {}}
        navGo={() => {}} />).toJSON()).toMatchSnapshot()
  })
})

TabAccountScreen.propTypes = {
  profile: PropTypes.object.isRequired,
  updateProfile: PropTypes.func.isRequired,
  signOut: PropTypes.func.isRequired,
  navGo: PropTypes.func.isRequired
}
