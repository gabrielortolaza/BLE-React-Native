/** Page appears to no longer be used */
/* eslint-disable */
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  TouchableOpacity,
  View,
  Text
} from 'react-native'

import { Colors, Fonts } from '../../Themes'
import StyleSheet from '../../Proportional'

export default class TextCheck extends PureComponent {
  render () {
    const {
      selected,
      onPress,
      children
    } = this.props
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} >
        <View style={styles.container}>
          <Text style={styles.text}>{children}</Text>
          <View style={styles.radioOutter}>
            <View style={[styles.radioInner, {opacity: selected ? 1 : 0}]} />
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.createProportional({
  container: {
    flexDirection: 'row',
    width: 90,
    alignItems: 'center'
  },
  text: {
    flex: 1,
    ...Fonts.SemiBold,
    fontSize: 14,
    color: 'white',
    textAlign: 'right'
  },
  radioOutter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.white20p,
    padding: 3,
    marginLeft: 6
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white
  }
})

TextCheck.propTypes = {
  selected: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  children: PropTypes.string.isRequired
}
