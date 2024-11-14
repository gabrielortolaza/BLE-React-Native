/** Page appears to no longer be used */
/* eslint-disable */
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { View, Picker } from 'react-native'

import Styles from './EditStyles'

import FocusableLabel from '../Shared/FocusableLabel'

export default class Recurrence extends PureComponent {
  render () {
    const {
      onFocus,
      onChange,
      focus,
      recurrencePeriod,
      recurrenceUnit,
      recurrenceString
    } = this.props

    return (
      <View>
        <View style={Styles.row}>
          <FocusableLabel
            style={Styles.flex1}
            onFocus={() => onFocus('recurrence')}
            focus={focus === 'recurrence'}
            value={recurrenceString}
            placeholder='Repeats weekly' />
        </View>
        {focus === 'recurrence' && (
          <View style={Styles.periodSelection}>
            <Picker
              style={Styles.flex1}
              selectedValue={recurrencePeriod}
              onValueChange={recurrencePeriod => onChange(recurrenceUnit, recurrencePeriod)}>
              <Picker.Item label='day' value='day' />
              <Picker.Item label='week' value='week' />
              <Picker.Item label='month' value='month' />
            </Picker>
            <Picker
              style={Styles.flex1}
              selectedValue={recurrenceUnit}
              onValueChange={recurrenceUnit => onChange(recurrenceUnit, recurrencePeriod)}>
              <Picker.Item label='1' value='1' />
              <Picker.Item label='2' value='2' />
              <Picker.Item label='3' value='3' />
              <Picker.Item label='4' value='4' />
              <Picker.Item label='5' value='5' />
              <Picker.Item label='6' value='6' />
              <Picker.Item label='7' value='7' />
            </Picker>
          </View>
        )}
      </View>
    )
  }
}

Recurrence.propTypes = {
  focus: PropTypes.string,
  recurrencePeriod: PropTypes.string,
  recurrenceUnit: PropTypes.string,
  recurrenceString: PropTypes.string,
  onFocus: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
}
