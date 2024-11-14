import React, { Component } from "react";
import PropTypes from "prop-types";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Linking,
  ScrollView
} from "react-native";
import HTMLView from "react-native-render-html";

import StyleSheet from "../../Proportional";
import { Colors, Fonts } from "../../Themes";
import { Welcome, BackButton } from "../Shared";
import { appWidth } from "../../Services/SharedFunctions";

const list = {
  TERMS_OF_SERVICE: {
    html: `
    <p style="text-align: center;background-color: transparent;">
      <strong style="color: #333333; background-color: transparent;">Privacy Notice</strong>
    </p>
    <p><span style="color: #333333; background-color: transparent;">This is a privacy notice and lets you know how Pumpables handles the information that we collect in the app. This privacy notice will cover:</span></p>
    <ol>
      <li><span style="background-color: transparent;">What personally identifiable information is collected from you through the app, how it is used and with whom it may be shared.</span></li>
      <li><span style="background-color: transparent;">What choices are available to you regarding the use of your data.</span></li>
      <li><span style="background-color: transparent;">The security procedures in place to protect the misuse of your information.</span></li>
      <li><span style="background-color: transparent;">How you can correct any inaccuracies in the information.</span></li>
    </ol>
    </br></br>
    <p><strong style="color: #333333; background-color: transparent;">Information Collection, Use and Sharing </strong></p>
    <p><span style="color: #333333; background-color: transparent;">We are the sole owners of the information collected on this app. We only have access to/collect information that you voluntarily give us via the app or other direct contact from you. We will not sell or rent this information to anyone.</span></p>
    <p><span style="color: #333333; background-color: transparent;">We may use the data collected on this app to make improvements to the app or inform design for future products. Your personal information will not be shared.</span></p>
    <p><strong style="color: #333333;">Registration</strong></p>
    <p><span style="color: #333333;">The Pumpables app requires you to complete a registration form. During registration you are required to give certain information (such as name and email address). This information may be used to contact you with marketing information about Pumpables. The app will be most useful to you if you provide information (such as your baby&rsquo;s age) but it is not required.</span></p>
    <p><strong style="color: #333333; background-color: transparent;">Your Access to and Control Over Information </strong></p>
    <p><span style="color: #333333; background-color: transparent;">You may opt out of any future contacts from us at any time. You can do the following at any time by contacting us via the email address given on our website:</span></p>
    <ul>
      <li><span style="background-color: transparent;">See what data we have about you, if any.</span></li>
      <li><span style="background-color: transparent;">Change/correct any data we have about you.</span></li>
      <li><span style="background-color: transparent;">Have us delete any data we have about you.</span></li>
      <li><span style="background-color: transparent;">Express any concern you have about our use of your data.</span></li>
    </ul>
    </br></br>
    <p><strong style="color: #333333; background-color: transparent;">Location</strong></p>
    <p><span style="color: #333333; background-color: transparent;">We collect location information(optional) to help the App and bluetooth perform better, this information is processed ephemerally and is never stored anywhere or used to identify you.</span></p>
    </br>
    <p><strong style="color: #333333; background-color: transparent;">Security</strong></p>
    <p><span style="color: #333333; background-color: transparent;">We take precautions to protect your information. When you record data in Pumpables, your information is protected both online and offline. </span></p>
    <p><span style="color: #333333; background-color: transparent;">While we use encryption to protect sensitive information transmitted online, we also protect your information offline. Only team members who need the information to perform a specific job (for example, customer service) are granted access to personally identifiable information. The data is kept in a secure environment.</span></p>
    <p><strong style="color: #333333; background-color: transparent;">If you feel that we are not abiding by this privacy policy, please contact us at <a href="mailto:hello@pumpables.co">hello@pumpables.co</a></strong></p>
    </br>`
  }
};

export default class TourTermsScreen extends Component {
  handleLinkOpen = (event, href) => {
    Linking.openURL(href);
  };

  render() {
    const { navigation } = this.props;
    return (
      <SafeAreaView style={styles.container}>
        <View testID="TourTermsScreen" style={styles.container}>
          <BackButton onPress={navigation.goBack} testID="TourTerms_Back" />
          <ScrollView style={styles.container}>
            <Welcome subtitle="Terms of Service and Privacy Policy" />
            <HTMLView
              source={list.TERMS_OF_SERVICE}
              baseStyle={styles.htmlView}
              renderersProps={{ a: { onPress: this.handleLinkOpen } }}
              contentWidth={appWidth}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

TourTermsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    backgroundColor: Colors.white
  },
  htmlView: { marginHorizontal: 48 },
  div: {
    ...Fonts.Regular,
    color: Colors.grey
  },
  strong: {
    ...Fonts.SemiBold
  }
});
