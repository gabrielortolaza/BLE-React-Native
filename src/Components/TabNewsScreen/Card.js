/** Page appears to no longer be used */
/* eslint-disable */
import React from 'react'
import {
  View,
  Linking
} from 'react-native'
import PropTypes from 'prop-types'
import firebase from "@react-native-firebase/app"

import StyleSheet from '../../Proportional'
import { CachedImage, Button, Label } from '../Shared'
import { Fonts, Colors } from '../../Themes/index'

const Placeholder = require('../../Assets/Images/placeholder.png')

class Card extends React.PureComponent {
  onClick = () => {
    firebase.analytics().logEvent('view_item', {
      item_id: this.props.id,
      link: this.props.link,
      title: this.props.title
    })
    Linking.openURL(this.props.link).catch(e => console.log(e))
  }

  render () {
    const { author, image, title } = this.props
    return (
      <Button testID='TabNews_Feed' onPress={this.onClick} >
        <View style={styles.container}>
          <CachedImage style={styles.newsImage} source={{uri: image}} placeholder={Placeholder} />
          <View style={styles.rectangle}>
            <Label numberOfLines={2} style={styles.cardText}>{title}</Label>
            <Label numberOfLines={1} style={styles.cardAuthor}>{author}</Label>
          </View>
        </View>
      </Button>
    )
  }
}

export default Card

const styles = StyleSheet.createProportional({
  container: {
    aspectRatio: 1.17
  },
  newsImage: {
    width: null,
    height: null,
    aspectRatio: 1.57,
    resizeMode: 'cover'
  },
  rectangle: {
    padding: 22,
    left: 28,
    right: 28,
    bottom: 40,
    position: 'absolute',
    backgroundColor: '#ffffff',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: {
      width: 0,
      height: 30
    },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 3
  },
  cardText: {
    ...Fonts.SemiBold,
    color: Colors.greyishBrown,
    letterSpacing: 1
  },
  cardAuthor: {
    fontSize: 10,
    ...Fonts.SemiBold,
    letterSpacing: 0.7,
    marginTop: 7,
    color: Colors.windowsBlue
  }
})

Card.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired
}
