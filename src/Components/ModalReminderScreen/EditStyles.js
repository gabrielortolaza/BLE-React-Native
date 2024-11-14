/** Page appears to no longer be used */
/* eslint-disable */
import { StyleSheet } from 'react-native'

import { Colors, Fonts } from '../../Themes'

export default StyleSheet.create({
  container: {
    padding: 30,
    marginTop: 15
  },
  title: {
    ...Fonts.SemiBold,
    fontSize: 14,
    textAlign: 'center',
    color: Colors.greyishBrown,
    paddingBottom: 30
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5
  },
  flex1: {
    flex: 1
  },
  inputText: {
    ...Fonts.SemiBold,
    borderRadius: 2,
    backgroundColor: Colors.paleGrey,
    color: Colors.greyishBrown,
    padding: 10
    //    marginTop: 10
  },
  dateInputText1: {
    flex: 1
  },
  dateInputText2: {
    flex: 2,
    marginHorizontal: 15
  },
  dateInputText3: {
    flex: 3
  },
  actionPicker: {
    padding: 0
  },
  actionItem: {
    ...Fonts.SemiBold,
    fontSize: 14,
    color: Colors.greyishBrown
  },
  inputFocus: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.seafomBlue
  },
  periodSelection: {
    flexDirection: 'row'
  },
  buttons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
    marginTop: 26
  },
  checkbox: {
    marginVertical: 12
  }
})
