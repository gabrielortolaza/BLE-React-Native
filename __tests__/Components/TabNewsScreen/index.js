import React from 'react'
import PropTypes from 'prop-types'
import { PropTypes as MobxPropTypes } from 'mobx-react'
import { shallow } from 'enzyme'

const NewsFeed = require('../../../src/Components/TabNewsScreen/Card').default
const TabNewsComponents = require('../../../src/Components/TabNewsScreen')
const TabNewsScreen = TabNewsComponents.default
const { TabNewsHeader, TabNewsEmptyList } = TabNewsComponents

const LIST_ITEM = {
  author: 'Pumpables Team',
  authorId: 190,
  id: 6553,
  link: 'https://pumpables.co/breastfeeding-with-flat-nipples/',
  media: 'https://pumpables.co/wp-content/uploads/2018/03/breastfeeding-with-flat-nipples-tips.jpg',
  mediaId: 6557,
  timestamp: '1520530792000',
  title: 'Breastfeeding with Flat Nipples'
}

describe('TourAuthScreen', () => {
  // it('TabNews - Header rendered', () => {
  //   const renderHeader = shallow(
  //     <TabNewsHeader />
  //   ).dive()

  //   expect(renderHeader.find({ testID: 'TabNews_Welcome' })).toHaveLength(1)
  //   expect(renderHeader).toMatchSnapshot()
  // })

  // it('TabNews - Empty List', () => {
  //   const renderEmptyList = shallow(
  //     <TabNewsEmptyList />
  //   ).dive()

  //   expect(renderEmptyList.find({ testID: 'TabNews_EmptyList' })).toHaveLength(1)
  //   expect(renderEmptyList).toMatchSnapshot()
  // })

  // it('TabNews - Default', () => {
  //   const render = shallow(
  //     <TabNewsScreen
  //       newsList={[]}
  //     />
  //   ).dive()

  //   expect(render.find({ testID: 'TabNews_List' })).toHaveLength(1)
  //   expect(render).toMatchSnapshot()
  // })

  it('TabNews - List with items', () => {
    const { author, media, title, link, id } = LIST_ITEM
    const render = shallow(
      <NewsFeed
        id={id}
        image={media}
        link={link}
        title={title}
        author={author}
      />
    ).dive()

    expect(render.find({ testID: 'TabNews_Feed' })).toHaveLength(1)
    expect(render).toMatchSnapshot()
  })
})

TabNewsScreen.propTypes = {
  newsList: PropTypes.oneOfType([MobxPropTypes.arrayOrObservableArray, PropTypes.array])
}

NewsFeed.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired
}
