/** Page appears to no longer be used */
/* eslint-disable */
import React, { PureComponent } from 'react'
import {
  Platform,
  View,
  DatePickerAndroid,
  DatePickerIOS,
  Text
} from 'react-native'

import { Styles } from '../../Themes'
import StyleSheet from '../../Proportional'

export default class Datepicker extends PureComponent {
  constructor (props) {
    super(props)
    this.state = { chosenDate: new Date() }

    this.setDate = this.setDate.bind(this)
  }

  setDate (newDate) {
    this.setState({chosenDate: newDate})
  }

  _renderSpecificDatepicker = () => {
    if (Platform.OS === 'ios') {
      return <DatePickerIOS date={this.state.chosenDate} onDateChange={this.setDate} />
    } else {
      try {
        const { action } = DatePickerAndroid.open({
          // Use `new Date()` for current date.
          // May 25 2020. Month 0 is January.
          date: new Date()
        })
        if (action !== DatePickerAndroid.dismissedAction) {
          // Selected year, month (0-11), day
        }
      } catch ({code, message}) {
        console.warn('Cannot open date picker', message)
      }
    }
  }

  render () {
    return (
      <View style={styles.container}>
        <Text>Choose your date</Text>
        <DatePickerIOS
          style={styles.datepicker}
          date={this.state.chosenDate}
          onDateChange={this.setDate} />
      </View>
    )
  }
}

const styles = StyleSheet.createProportional({
  container: {
    ...Styles.absoluteFillObject,
    zIndex: 10,
    backgroundColor: 'white'
  },
  datepicker: {
    flex: 1,
    justifyContent: 'center'
  }
})
