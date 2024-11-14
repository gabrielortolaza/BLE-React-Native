/** Page appears to no longer be used */
/* eslint-disable */
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { View } from 'react-native'
import moment from 'moment'

import Styles from './EditStyles'

import { AlternateDatePicker, FocusableLabel } from '../Shared'

export default class DateTime extends PureComponent {
  onFocus = () => this.props.onFocus('startsAt')

  onCancel = () => this.props.onBlur()

  onConfirm = date => {
    const {
      onBlur,
      onChange
    } = this.props
    onBlur()
    onChange(date.getTime())
  }

  render () {
    const {
      startsAt,
      focus,
      onFocus
    } = this.props

    const showPicker = focus === 'startsAt'
    const momentStartedAt = moment(startsAt, 'x')

    return (
      <View style={Styles.row}>
        <FocusableLabel
          flexGrow
          onFocus={onFocus}
          focus={focus === 'startsAt'}
          value={momentStartedAt.format('D MMM YYYY h:mmA')}
        />

        {showPicker && (
          <AlternateDatePicker
            date={momentStartedAt.toDate()}
            onConfirm={this.onConfirm}
            mode='datetime'
            onCancel={this.onCancel}
          />
        )}
      </View>
    )
  }
}

DateTime.propTypes = {
  startsAt: PropTypes.number,
  focus: PropTypes.string,
  onBlur: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
}
