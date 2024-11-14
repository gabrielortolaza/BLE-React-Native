import React from 'react'
import { shallow } from 'enzyme'

import ModalHelpScreen, {
  RenderFlatListItem
} from '../../../src/Components/ModalHelpScreen'

const helpList = [
  {
    'entries': [{
      'answer': 'answer 1 - 1',
      'createdAt': 1,
      'order': 1,
      'question': 'question 1 - 1'
    }, {
      'answer': 'answer 1 - 1',
      'createdAt': 1,
      'order': 2,
      'question': 'question 1 - 1'
    }],
    'id': 'topic1',
    'key': 'topic1',
    'order': 1,
    'title': 'Topic 1',
    'updatedAt': 1
  },
  {
    'entries': [{
      'answer': 'answer 2 - 1',
      'createdAt': 1,
      'order': 1,
      'question': 'question 2 - 1'
    }, {
      'answer': 'answer 2 - 2',
      'createdAt': 1,
      'order': 2,
      'question': 'question 2 - 2'
    }, {
      'answer': 'answer 2 - 3',
      'createdAt': 1,
      'order': 3,
      'question': 'question 2 - 3'
    }],
    'id': 'topic2',
    'key': 'topic2',
    'order': 2,
    'title': 'Topic 2',
    'updatedAt': 2
  }
]

describe('ModalHelpScreen', () => {
  it('Empty', () => {
    const wrapper = shallow(<ModalHelpScreen helpList={[]} back={jest.fn()} />)

    const render = wrapper.dive()

    expect(render.isEmptyRender()).toBeFalsy()
    expect(render).toMatchSnapshot(`Empty Contents`)
    expect(render.find({ testID: 'Help_FAQ' })).toHaveLength(1)
  })

  it('Default', () => {
    const wrapper = shallow(<ModalHelpScreen helpList={helpList} back={jest.fn()} />)

    const render = wrapper.dive()

    expect(render.isEmptyRender()).toBeFalsy()
    expect(render).toMatchSnapshot(`Default Contents`)
    expect(render.find({ testID: 'Help_FAQ' })).toHaveLength(1)
    expect(render.find({ testID: 'TabViewAnimated' })).toHaveLength(1)

    const renderTabViewAnimated = render.find({ testID: 'TabViewAnimated' }).dive()
    expect(renderTabViewAnimated).toMatchSnapshot(`TabViewAnimated Contents`)
    expect(renderTabViewAnimated.find({ testID: 'TabBar' })).toHaveLength(1)
    expect(renderTabViewAnimated.find({ testID: 'FlatList' })).toHaveLength(2)

    const flatListFindResults = renderTabViewAnimated.find({ testID: 'FlatList' })
    expect(flatListFindResults).toHaveLength(2)
  })

  it('RenderFlatListItem', async () => {
    const wrapper = shallow(RenderFlatListItem({
      item: helpList[0].entries[0],
      index: 0
    }))
    expect(wrapper).toMatchSnapshot()

    const renderHelpItem = wrapper.dive()
    expect(renderHelpItem).toMatchSnapshot()
    expect(renderHelpItem.find({ testID: 'HelpItem_Arrow' })).toHaveLength(1)
    expect(renderHelpItem.find({ testID: 'HelpItem_Answer' })).toHaveLength(0)

    const renderHelpItemQuestion = renderHelpItem.find({ testID: 'HelpItem_Question' })
    expect(renderHelpItemQuestion).toHaveLength(1)
    expect(renderHelpItemQuestion.render().text()).toBe(helpList[0].entries[0].question)

    const renderHelpItemTouchable = renderHelpItem.find({ testID: 'HelpItem_Touchable' }).first()
    expect(renderHelpItemTouchable).toBeDefined()

    wrapper.setState({opened: true})
    wrapper.update()

    expect(wrapper).toMatchSnapshot()

    const renderHelpItemAnswer = wrapper.dive().find({ testID: 'HelpItem_Answer' })
    expect(renderHelpItemAnswer).toHaveLength(1)
    expect(renderHelpItemAnswer.prop('value')).toBe(`<p>${helpList[0].entries[0].answer}</p>`)
  })
})
