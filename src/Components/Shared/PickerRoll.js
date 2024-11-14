/** Page appears to no longer be used */
/* eslint-disable */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Picker } from 'react-native'

import StyleSheet from '../../Proportional'

export default class PickerRoll extends Component {
  state = {
    hasFocus: false,
    selected: ''
  }

  onChange = selected => {
    this.setState({ selected })
    this.props.onValueChange(selected)
  }

  render () {
    const { items, itemStyle, style, selectedValue } = this.props
    return (
      <Picker
        style={[styles.container, style]}
        onValueChange={selected => this.onChange(selected)}
        mode='dropdown'
        itemStyle={itemStyle}
        selectedValue={selectedValue + ''}>
        {items.map(item => (
          <Picker.Item
            key={item.value + ''}
            label={item.label + ''}
            value={item.value + ''} />
        ))}
      </Picker>
    )
  }
}

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  }
})

PickerRoll.propTypes = {
  items: PropTypes.array.isRequired,
  itemStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  style: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  selectedValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onValueChange: PropTypes.func.isRequired
}
