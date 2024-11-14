import React from 'react'
import renderer from 'react-test-renderer'

const Element = require('../../../src/Components/Shared/Welcome').default

test('Welcome', () => {
  expect(renderer.create(<Element />).toJSON()).toMatchSnapshot()
})

test('Title', () => {
  expect(renderer.create(<Element title='Welcome Title' />).toJSON()).toMatchSnapshot()
})

test('Subtitle', () => {
  expect(renderer.create(<Element subtitle='Welcome Subtitle' />).toJSON()).toMatchSnapshot()
})

test('Title + Subtitle', () => {
  expect(renderer.create(<Element title='Welcome Title' subtitle='Welcome Subtitle' />).toJSON()).toMatchSnapshot()
})

test('Title + Subtitle + Alt', () => {
  expect(renderer.create(<Element title='Welcome Title' subtitle='Welcome Subtitle' alt />).toJSON()).toMatchSnapshot()
})

test('Title + Subtitle + Flex', () => {
  expect(renderer.create(<Element title='Welcome Title' subtitle='Welcome Subtitle' flex />).toJSON()).toMatchSnapshot()
})

test('Title + Subtitle + Alt + Flex', () => {
  expect(renderer.create(<Element title='Welcome Title' subtitle='Welcome Subtitle' alt flex />).toJSON()).toMatchSnapshot()
})
