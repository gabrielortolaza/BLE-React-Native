// var firebase = require('react-native-firebase')

// jest.mock('Dimensions')

// const HelpStore = require('../../src/Store/helpStore').default

// it('Help Store', () => {
//   const ref = firebase.database().ref('public/helpCenter')
//   ref.set(require('./helpStore.json').data)
//   const store = new HelpStore()
//   ref.flush()

//   expect(store.list).toHaveLength(2)

//   const topic1 = store.list[0]
//   expect(topic1.id).toBeDefined()
//   expect(topic1.key).toBeDefined()
//   expect(topic1.title).toBeDefined()
//   expect(topic1.order).toBeDefined()
//   expect(topic1.entries).toHaveLength(2)

//   const topic2 = store.list[1]
//   expect(topic1.order).toBeLessThan(topic2.order)

//   const entry1 = topic1.entries[0]
//   const entry2 = topic1.entries[1]

//   expect(entry1.question).toBeDefined()
//   expect(entry1.answer).toBeDefined()
//   expect(entry1.order).toBeDefined()
//   expect(entry1.order).toBeLessThan(entry2.order)
// })
