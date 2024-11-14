/** Page appears to no longer be used */
/* eslint-disable */
import React, { Component } from 'react'
import { View, Text, Keyboard } from 'react-native'
import PropTypes from 'prop-types'

import ActionPicker from './ActionPicker'
import DateTime from './DateTime'
import Recurrence from './Recurrence'

import Styles from './EditStyles'

import RoundButton from '../Shared/RoundButton'
import FocusableLabel from '../Shared/FocusableLabel'

export default class Edit extends Component {
  constructor (props) {
    super()

    this.state = {
      focus: ''
    }
  }

  clearFocus = () => this.setState({ focus: '' })

  onCancel = () => {
    Keyboard.dismiss()
    this.clearFocus()
    this.props.cancel()
  }

  onSave = async () => {
    Keyboard.dismiss()
    this.clearFocus()
    await this.props.save()
    this.props.cancel()
  }

  onChangeAction = action => this.props.update({action})
  onChangeDateTime = startsAt => this.props.update({startsAt})
  onChangeNotes = notes => this.props.update({notes})
  onChangeRecurrence = (recurrenceUnit, recurrencePeriod) => this.props.update({recurrenceUnit, recurrencePeriod})

  toggleFocus = focusId => this.setState({ focus: this.state.focus === focusId ? '' : focusId })

  onFocusActionPicker = () => this.setState({focus: 'action'})
  onFocusDateTime = () => this.setState({focus: 'startsAt'})
  onFocusRecurrence = () => this.setState({focus: 'recurrence'})
  onFocusNotes = () => this.setState({focus: 'notes'})

  render () {
    const {
      focus
    } = this.state
    const {
      reminder
    } = this.props

    const showSaveButton = !!(reminder.action && reminder.action)

    return (
      <View style={Styles.container}>
        <Text style={Styles.title}>{reminder.key ? 'Edit' : 'Add'} Reminder</Text>
        <ActionPicker
          action={reminder.action}
          focus={focus}
          onBlur={this.clearFocus}
          onChange={this.onChangeAction}
          onFocus={this.onFocusActionPicker}
        />

        <DateTime
          focus={focus}
          onBlur={this.clearFocus}
          onChange={this.onChangeDateTime}
          onFocus={this.onFocusDateTime}
          startsAt={reminder.startsAt}
        />

        <Recurrence
          focus={focus}
          recurrencePeriod={reminder.recurrencePeriod}
          recurrenceUnit={reminder.recurrenceUnit}
          recurrenceString={reminder.recurrenceString}
          onFocus={this.onFocusRecurrence}
          onChange={this.onChangeRecurrence}
        />

        <View style={Styles.row}>
          <FocusableLabel
            flexGrow
            input
            onSubmitEditing={Keyboard.dismiss}
            onChangeText={this.onChangeNotes}
            onFocus={this.onFocusNotes}
            focus={focus === 'notes'}
            value={reminder.notes}
            placeholder='Notes'
          />
        </View>
        {showSaveButton && (
          <View style={Styles.buttons}>
            <RoundButton white minimal small warmGreyText onPress={this.onCancel}>Cancel</RoundButton>
            <RoundButton shadow minimal small onPress={this.onSave}>Save</RoundButton>
          </View>
        )}
      </View>
    )
  }
}

Edit.propTypes = {
  reminder: PropTypes.object,
  update: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired
}
