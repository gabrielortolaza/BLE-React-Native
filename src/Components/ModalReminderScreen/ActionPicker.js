/** Page appears to no longer be used */
/* eslint-disable */
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { View, Picker, Platform } from 'react-native'

import FocusableLabel from '../Shared/FocusableLabel'
import { ACTIONS_MAP } from '../../Store/remindersStore'

import Styles from './EditStyles'

export default class ActionPicker extends PureComponent {
  onFocus = () => this.props.onFocus('action')

  onChange = action => {
    this.props.onChange(action)
    if (Platform.OS === 'android') {
      this.props.onBlur()
    }
  }

  render () {
    const {
      focus,
      action
    } = this.props

    return (
      <View>
        <View style={Styles.row}>
          <FocusableLabel
            flexGrow
            focus={focus === 'action'}
            onFocus={this.onFocus}
            placeholder='Choose Action...'
            style={Styles.flex1}
            textStyle={Styles.flex1}
            value={ACTIONS_MAP[action] || ''}
          />
        </View>
        {focus === 'action' && (
          <Picker
            itemStyle={Styles.actionItem}
            mode='dropdown'
            onValueChange={this.onChange}
            selectedValue={action}
            style={Styles.actionPicker}
          >
            { Object.keys(ACTIONS_MAP).map(key => (
              <Picker.Item key={key} label={ACTIONS_MAP[key]} value={key} />
            )) }
          </Picker>
        )}
      </View>
    )
  }
}

ActionPicker.propTypes = {
  focus: PropTypes.string,
  action: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func
}
