/** Page appears to no longer be used */
/* eslint-disable */
import React, { PureComponent } from 'react'
import { Image, Animated } from 'react-native'
import RNFS from 'react-native-fs'
import PropTypes from 'prop-types'
const Buffer = require('buffer/').Buffer

let isFetching = false
const requestList = {}
const pendingList = []

const sanitizeSourceUri = sourceUri => {
  let splitAt = sourceUri.indexOf('?')

  if (splitAt === -1) {
    splitAt = sourceUri.indexOf('#')
    if (splitAt === -1) {
      return sourceUri
    }
  }
  return sourceUri.substr(0, splitAt)
}

const CACHE_DIR = RNFS.CachesDirectoryPath + '/RNCIFS/'
// const CACHE_URL = 'asset:///RNCIFS/'

RNFS.mkdir(CACHE_DIR)

const fetch = async () => {
  if (isFetching || pendingList.length === 0) {
    return
  }
  isFetching = true
  const sourceUri = pendingList.shift()
  // TODO: Change the folder to something project based.
  const fullImagePath = CACHE_DIR + Buffer.from(sourceUri).toString('base64')
  // https://stackoverflow.com/questions/6581433/max-length-of-file-name
  // Unsure about this limitation. Keeping just in case
  if (fullImagePath.length < 900) {
    try {
      let existsResult = await RNFS.exists(fullImagePath)
      if (!existsResult) {
        const downloadJob = await RNFS.downloadFile({
          fromUrl: sourceUri,
          toFile: fullImagePath
        })
        await downloadJob.promise
      }
      const cachedData = await RNFS.readFile(fullImagePath, 'base64')
      requestList[sourceUri].resolver({uri: 'data:image/png;base64,' + cachedData})
      // requestList[sourceUri].resolver({uri: 'asset://' + fullImagePath}) // 'file://' +
    } catch (readError) {
      console.log(`Cache Error: ${readError.message}`)
    }
  } else {
    requestList[sourceUri].rejector(new Error(`Filename is too long!`))
  }
  isFetching = false
  fetch()
}

const schedule = sourceUri => {
  sourceUri = sanitizeSourceUri(sourceUri)
  if (!requestList[sourceUri]) {
    requestList[sourceUri] = new Promise((resolve, reject) => {
      setTimeout(() => {
        requestList[sourceUri].resolver = resolve
        pendingList.push(sourceUri)
        fetch()
      }, 10)
    })
  }
  return requestList[sourceUri]
}

export default class CacheableImage extends PureComponent {
  constructor (props) {
    super()
    this.state = {
      source: null
    }
    if (props.source && props.source.uri) {
      this.fetch(props.source.uri)
    }
  }

  componentDidMount = () => { this.mounted = true }

  componentWillUnmount = () => { this.mounted = false }

  componentWillReceiveProps (props) {
    if (props.source && props.source.uri && props.source.uri !== this.props.source.uri) {
      this.fetch(props.source.uri)
    }
  }

  fetch = sourceUri => {
    try {
      if (typeof sourceUri === 'string') {
        schedule(sourceUri).then(source => {
          if (this.mounted) {
            this.setState({source})
          }
        })
      }
    } catch (e) {
      console.log(`Failed to Download ${sourceUri}`)
    }
  }

  render () {
    const props = this.props
    const Element = props.animated ? Animated.Image : Image
    return <Element {...props} source={this.state.source || props.placeholder || props.source} />
  }
}

CacheableImage.propTypes = {
  source: PropTypes.shape({
    uri: PropTypes.string
  })
}
