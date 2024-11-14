// var firebase = require('react-native-firebase')

// jest.mock('Dimensions')

// const NewsStore = require('../../src/Store/newsStore').default

// it('News Store', () => {
//   const ref = firebase.database().ref('public/blog')
//   ref.set(require('./newsStore.json').data)
//   const store = new NewsStore()
//   ref.flush()
//   expect(store.list).toHaveLength(3)
//   const item = store.list[0]
//   expect(item.author).toBe('Pumpables Team')
//   expect(item.authorId).toBe(2)
//   expect(item.id).toBe(3926)
//   expect(item.link).toBe('https://pumpables.co/youre-loving-pumpables-milk-genie/')
//   expect(item.media).toBe('https://pumpables.co/wp-content/uploads/2017/02/Singlemumdiaries-5-of-12.jpg')
//   expect(item.mediaId).toBe(3400)
//   expect(item.timestamp).toBe('3')
//   expect(item.title).toBe('What you&#8217;re loving about the Pumpables Milk Genie <3')
// })
