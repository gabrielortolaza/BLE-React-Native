/** Page appears to no longer be used */
/* eslint-disable */
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { PropTypes as MobxPropTypes } from 'mobx-react'
import { KeyboardAvoidingView, ScrollView, View, Platform } from 'react-native'

import { Colors } from '../../Themes'
import StyleSheet from '../../Proportional'
import { ConfirmationToast, ModalWrapper, Welcome } from '../Shared'

import Card from './Card'
import Edit from './Edit'

export default class ModalReminderScreen extends PureComponent {
  render () {
    const {
      applyChanges,
      back,
      cancelChanges,
      currentReminder,
      deletingEntry,
      reminders,
      saveChanges,
      setCurrentReminder,
      setDeletingReminder,
      deleteConfirm,
      deleteDeny
    } = this.props

    return (
      <ModalWrapper back={back} >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : null}>
          <ScrollView ref={scrollview => { this._scrollview = scrollview }}>
            <Welcome title='Reminder' subtitle="Don't forget anything" />
            <View style={styles.reminders}>
              {reminders.map(reminder => (
                <View key={reminder.key}>
                  <Card
                    reminderKey={reminder.key}
                    onPressDelete={setDeletingReminder}
                    onPressEdit={setCurrentReminder}
                    {...reminder}
                  />
                  {currentReminder.key === reminder.key &&
                    <Edit
                      reminder={currentReminder}
                      update={applyChanges}
                      save={saveChanges}
                      cancel={cancelChanges} />}
                </View>
              )) }
              {!currentReminder.key &&
                <Edit
                  reminder={currentReminder}
                  update={applyChanges}
                  save={saveChanges}
                  cancel={cancelChanges} />}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        {!!deletingEntry && (
          <ConfirmationToast
            title='Remove Reminder'
            subtitle='Would you like to remove this reminder?'
            onPressConfirm={deleteConfirm}
            onPressDeny={deleteDeny} />
        )}
      </ModalWrapper>
    )
  }
}

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: Colors.paleGrey
  },
  reminders: {
    paddingHorizontal: 30,
    paddingBottom: 30
  },
  mainTitle: {
    fontSize: 50,
    fontWeight: '300',
    lineHeight: 60.0,
    color: Colors.greyishBrown,
    marginLeft: 18,
    marginTop: 73
  },
  subtitle: {
    fontWeight: 'bold',
    color: Colors.warmGrey,
    marginLeft: 18,
    marginTop: 20,
    marginBottom: 23
  }
})

ModalReminderScreen.propTypes = {
  back: PropTypes.func.isRequired,
  reminders: MobxPropTypes.arrayOrObservableArray.isRequired,
  saveChanges: PropTypes.func.isRequired,
  applyChanges: PropTypes.func.isRequired,
  cancelChanges: PropTypes.func.isRequired,
  currentReminder: PropTypes.object,
  deletingEntry: PropTypes.object,
  setCurrentReminder: PropTypes.func.isRequired,
  setDeletingReminder: PropTypes.func.isRequired,
  deleteConfirm: PropTypes.func.isRequired,
  deleteDeny: PropTypes.func.isRequired
}
