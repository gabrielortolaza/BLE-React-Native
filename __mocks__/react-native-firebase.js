var firebasemock = require('firebase-mock')

var mockAuth = new firebasemock.MockFirebase()
var mockDatabase = new firebasemock.MockFirebase()
var mocksdk = new firebasemock.MockFirebaseSdk(
  (path) => {
    const ref = path ? mockDatabase.child(path) : mockDatabase
    ref.keepSynced = () => {}
    return ref
  },
  () => mockAuth
)

const mock = {
  ...mocksdk,
  messaging: () => ({
    onTokenRefresh: () => {},
    requestPermissions: () => new Promise(),
    subscribeToTopic: () => {},
    unsubscribeFromTopic: () => {}
  }),
  analytics: () => ({
    logEvent: () => {},
    setCurrentScreen: () => {},
    setUserId: () => {}
  })
}

export default module.exports = mock
