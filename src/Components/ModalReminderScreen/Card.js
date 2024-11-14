/** Page appears to no longer be used */
/* eslint-disable */
import React, { PureComponent } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'

import { Colors, Fonts } from '../../Themes'
import StyleSheet from '../../Proportional'

import Edit from '../../Assets/Images/Icons/editCopy.png'
import Remove from '../../Assets/Images/Icons/deleteCopy.png'

import { ImageButton } from '../Shared'

import { ACTIONS_MAP, getRecurrenceString } from '../../Store/remindersStore'

export default class Card extends PureComponent {
  onPressEdit = () => this.props.onPressEdit(this.props.reminderKey)
  onPressDelete = () => this.props.onPressDelete(this.props.reminderKey)

  render () {
    const {
      notes,
      recurrencePeriod,
      recurrenceUnit,
      action,
      startsAt
    } = this.props
    let recurrenceString = this.props.recurrenceString || "";

    if (!recurrenceString || recurrenceString.indexOf(' at ') === -1) {
      recurrenceString = getRecurrenceString({
        recurrenceUnit,
        recurrencePeriod,
        startsAt
      })
    }

    return (
      <View style={styles.container}>
        <Text style={[styles.addReminderTitle, styles.texts]}>
          {ACTIONS_MAP[action]}{notes ? ` - ${notes}` : ''}
        </Text>
        <Text style={[styles.subtitle, styles.texts]}>
          {recurrenceString}
        </Text>
        <View style={styles.options}>
          <ImageButton
            onPress={this.onPressEdit}
            source={Edit}
            style={styles.icons}
          />
          <ImageButton
            onPress={this.onPressDelete}
            positionStyle={styles.iconPosition}
            source={Remove}
            style={styles.icons}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 28,
    marginTop: 12,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    elevation: 5,
    shadowColor: 'rgba(0, 0, 0, 1)',
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.2
  },
  texts: {
    letterSpacing: 1.0,
    backgroundColor: 'transparent'
  },
  addReminderTitle: {
    ...Fonts.SemiBold,
    color: Colors.greyishBrown,
    marginBottom: 6
  },
  subtitle: {
    ...Fonts.SemiBold,
    fontSize: 12,
    letterSpacing: 1.0,
    color: Colors.blue
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignContent: 'center'
  },
  icons: {
    height: 14,
    width: 14,
    margin: 10
  },
  iconPosition: {
    marginLeft: 10
  },
  iconBorder: {
    borderWidth: 1
  }
})

Card.propTypes = {
  action: PropTypes.string.isRequired,
  notes: PropTypes.string.isRequired,
  onPressDelete: PropTypes.func.isRequired,
  onPressEdit: PropTypes.func.isRequired,
  recurrencePeriod: PropTypes.string.isRequired,
  recurrenceString: PropTypes.string.isRequired,
  recurrenceUnit: PropTypes.string.isRequired,
  reminderKey: PropTypes.string.isRequired,
  startsAt: PropTypes.number.isRequired
}
