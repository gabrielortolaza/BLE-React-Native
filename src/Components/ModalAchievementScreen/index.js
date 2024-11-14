/** Page appears to no longer be used */
/* eslint-disable */
// import React, { Component } from 'react'
// import {
//   View,
//   Image,
//   Animated,
//   Dimensions,
//   Text,
//   Modal
// } from 'react-native'
// import PropTypes from 'prop-types'
// import LinearGradient from 'react-native-linear-gradient'
// // import LottieView from 'lottie-react-native'

// import StyleSheet from '../../Proportional'
// import { RoundButton } from '../Shared/index'
// import Fonts from '../../Themes/Fonts'

// const Lighting1 = require('../../Assets/Animations/Lighting1.json')
// const Lighting2 = require('../../Assets/Animations/Lighting2.json')

// export const getAchievementImage = achievementId => {
//   switch (achievementId) {
//     case 'age_1':
//     case 'streak_1':
//     case 'volume_1':
//     case 'badge_1':
//       return require('../../Assets/Images/Milestones/step1.png')
//     case 'age_2':
//     case 'streak_2':
//     case 'volume_2':
//     case 'volume_3':
//     case 'badge_2':
//       return require('../../Assets/Images/Milestones/step2.png')
//     case 'age_3':
//     case 'badge_3':
//       return require('../../Assets/Images/Milestones/step3.png')
//     case 'age_4':
//     case 'badge_4':
//       return require('../../Assets/Images/Milestones/step4.png')
//     case 'age_5':
//     case 'badge_5':
//       return require('../../Assets/Images/Milestones/step5.png')
//   }
// }

// export default class ModalAchievementScreen extends Component {
//   state = {
//     animation: new Animated.Value(0)
//   }

//   static navigationOptions = {
//     header: null
//   }

//   setAnim = (anim) => {
//     if (!this.anim) {
//       this.anim = anim
//       this.anim.play()
//     }
//   }

//   onPressOk = () => {
//     if (this.props.achievementDisplayed) {
//       this.props.achievementDisplayed(this.props.achievement.key)
//     }
//   }

//   render () {
//     if (!this.props.achievement) {
//       return null
//     }
//     const {
//       key,
//       texts
//     } = this.props.achievement

//     if (!key || !texts) {
//       return null
//     }

//     const {
//       allCenter,
//       title1,
//       title2,
//       subtitle,
//       description
//     } = texts

//     const altLayout = texts.altLayout && !allCenter

//     return (
//       <Modal
//         onDismiss={this.onPressOk}
//         onRequestClose={this.onPressOk}
//         testID='AchievementScreen'
//       >
//         <LinearGradient
//           colors={['rgb(133, 155, 224)', 'rgb(82, 176, 208)']}
//           style={styles.container}
//           testID='AchievementScreen_Gradient'
//         >
//           {
//             // <LottieView
//             //   ref={this.setAnim}
//             //   source={altLayout ? Lighting2 : Lighting1}
//             //   resizeMode='cover'
//             //   contentMode='aspectFill'
//             //   style={StyleSheet.absoluteFill}
//             //   testID={altLayout ? 'AchievementScreen_LottieAlt' : 'AchievementScreen_Lottie'}
//             //   autoSize
//             // />
//           }
//           {!altLayout && (
//             <View
//               style={styles.top}
//               testID='AchievementScreen_Top'
//             >
//               <Text
//                 style={[styles.title, allCenter && styles.titleCenter]}
//                 testID={allCenter ? 'AchievementScreen_TopTitleCenter' : 'AchievementScreen_TopTitle'}
//               >{title1}</Text>
//               {(!!subtitle && !allCenter) && (
//                 <Text
//                   style={styles.subtitle}
//                   testID='AchievementScreen_TopSubtitle'
//                 >{subtitle}</Text>
//               )}
//             </View>
//           )}
//           <View
//             style={altLayout ? styles.imageRight : styles.imageCenter}
//             testID={altLayout ? 'AchievementScreen_AltImage' : 'AchievementScreen_CenterImage'}
//           >
//             {altLayout && (
//               <Text
//                 style={[styles.title, styles.titleWithImage]}
//                 testID='AchievementScreen_AltTitle'
//               >{title1}</Text>
//             )}
//             <Image
//               testID='AchievementScreen_Image'
//               source={getAchievementImage(key)}
//             />
//           </View>
//           {altLayout && (
//             <View
//               style={styles.bottom}
//               testID='AchievementScreen_Bottom'
//             >
//               <Text
//                 style={styles.title}
//                 testID='AchievementScreen_BottomTitle'
//               >{title2}</Text>
//               <Text
//                 style={styles.subtitle}
//                 testID='AchievementScreen_BottomSubtitle'
//               >{subtitle}</Text>
//             </View>
//           )}
//           <View
//             style={[styles.footer, allCenter && styles.footerCenter]}
//             testID={allCenter ? 'AchievementScreen_FooterCenter' : 'AchievementScreen_Footer'}
//           >
//             <Text
//               style={[styles.description, !allCenter && styles.descriptionFullWidth]}
//               testID={allCenter ? 'AchievementScreen_DescriptionCenter' : 'AchievementScreen_Description'}
//             >{description}</Text>
//             <RoundButton
//               minimal
//               onPress={this.onPressOk}
//               small
//               testID='AchievementScreen_Ok'
//               white
//             >Okay!</RoundButton>
//           </View>
//         </LinearGradient>
//       </Modal>
//     )
//   }
// }

// const styles = StyleSheet.createProportional({
//   container: {
//     flex: 1,
//     backgroundColor: 'transparent',
//     paddingVertical: 35
//   },
//   title: {
//     ...Fonts.Light,
//     fontSize: 50,
//     lineHeight: 60,
//     color: 'white',
//     paddingTop: 10
//   },
//   titleCenter: {
//     paddingTop: 10,
//     textAlign: 'center'
//   },
//   titleWithImage: {
//     position: 'absolute',
//     left: 40,
//     bottom: -5
//   },
//   subtitle: {
//     ...Fonts.SemiBold,
//     fontSize: 14,
//     color: 'white',
//     lineHeight: 20
//   },
//   top: {
//     paddingHorizontal: 40
//   },
//   bottom: {
//     paddingBottom: 20,
//     paddingHorizontal: 40
//   },
//   imageCenter: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   imageRight: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     alignItems: 'flex-end',
//     paddingBottom: 10
//   },
//   description: {
//     ...Fonts.Light,
//     fontSize: 12,
//     color: 'white',
//     marginRight: 18,
//     minHeight: 30
//   },
//   descriptionFullWidth: {
//     flex: 1,
//     minHeight: 38
//   },
//   footer: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     paddingHorizontal: 40
//   },
//   footerCenter: {
//     paddingTop: 15,
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   backgroundImage: {
//     width: Dimensions.get('screen').width,
//     height: Dimensions.get('screen').height
//   }
// })

// ModalAchievementScreen.propTypes = {
//   achievementDisplayed: PropTypes.func,
//   achievement: PropTypes.shape({
//     key: PropTypes.string,
//     texts: PropTypes.shape({
//       altLayout: PropTypes.bool,
//       allCenter: PropTypes.bool,
//       title1: PropTypes.string,
//       title2: PropTypes.string,
//       subtitle: PropTypes.string,
//       description: PropTypes.string
//     })
//   })
// }
