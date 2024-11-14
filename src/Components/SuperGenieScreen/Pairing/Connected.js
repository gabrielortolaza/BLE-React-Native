import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Image, StyleSheet, View,
  TouchableOpacity, Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Icon from "../../Shared/Icon";
import { Colors, Images } from "../../../Themes";
import { Label, ButtonRound } from "../../Shared";
import Container from "../../Shared/Container";
import * as C from "../../../Config/constants";
import * as M from "../../../Config/messages";
import { isEmpty, checkNavigateForPlayOption, appWidth } from "../../../Services/SharedFunctions";
import { setPrevPlayOptionSelected } from "../../../Actions";
import { REMEMBER_DEVICE_ID } from "../../../Config/LocalStorage";

const ACCEPTED = "Accepted";
const REJECTED = "rejected";
const ACCEPT_PAIRING = "Press OK on your pump to continue";

export default class Connected extends Component {
  constructor(props) {
    super(props);
    this.state = {
      instructionTxt: props.pump.pumpDevice === C.PUMP_DEVICE.GG2 ? "Press + on your pump to continue" : "Press OK on your pump to continue",
      responseStr: props.pump.pumpDevice === C.PUMP_DEVICE.GG2 ? "Press + on your pump to continue" : ACCEPT_PAIRING,
    };
  }

  componentDidMount() {
    const { pump } = this.props;
    const { connectedId } = pump;

    AsyncStorage.getItem(REMEMBER_DEVICE_ID)
      .then((val) => {
        if (!val || val !== connectedId) {
          // Send connect request if there is no remember device,
          // or remember device id is not equal to current device id
          setTimeout(() => {
            this.sendConnectRequest();
          }, 1000); // Time for App/pump interaction
        }
      });
  }

  componentDidUpdate(prevProps) {
    const { pump } = this.props;
    const { connectResponse } = pump;
    let { responseStr } = this.state;

    if (connectResponse === C.OP_ACCEPT && prevProps.pump.connectResponse !== C.OP_ACCEPT) {
      responseStr = ACCEPTED;
      this.onNext();
    } else if (
      connectResponse === C.OP_REJECT
      && responseStr !== REJECTED
      && prevProps.pump.connectResponse !== C.OP_REJECT
    ) {
      responseStr = REJECTED;
      this.setState({ responseStr });
    }
  }

  sendConnectRequest = () => {
    const { instructionTxt } = this.state;
    const { sendConnectRequest } = this.props;

    this.setState({ responseStr: instructionTxt });
    sendConnectRequest();
  }

  onNext = () => {
    const {
      pump, navigation, addMessage,
      rememberDevice, status
    } = this.props;
    const { connectedId, programs } = pump;
    const { prevPlayOptionSelected } = status;

    rememberDevice(connectedId);
    if (isEmpty(programs)) {
      addMessage(M.LAUNCH_APP_AGAIN);
    } else {
      checkNavigateForPlayOption(prevPlayOptionSelected, setPrevPlayOptionSelected, navigation);
    }
  }

  render() {
    const { pump, navigation } = this.props;
    const { responseStr, instructionTxt } = this.state;

    return (
      <Container
        noScroll
        style={[
          Styles.container,
          {
            backgroundColor: responseStr === REJECTED
              ? Colors.backgroundLightGreen : Colors.backgroundBlue
          }
        ]}
      >
        <TouchableOpacity
          onPress={navigation.goBack}
          style={Styles.closeBtnView}
        >
          <Icon
            style={[
              Styles.closeIcon,
              { color: responseStr === REJECTED ? Colors.green : Colors.blue }
            ]}
            name="close"
          />
        </TouchableOpacity>
        <Image
          source={responseStr === REJECTED ? Images.supergenieRejected : Images.supergeniePaired1}
          style={Styles.genieImg}
        />
        <Label
          font20
          maxFontSizeMultiplier={1.2}
          center
          weightSemiBold
          black={responseStr !== REJECTED}
          darkGreen={responseStr === REJECTED}
        >
          {`Pairing ${responseStr === REJECTED ? responseStr : "almost done"}`}
        </Label>
        {
          responseStr === REJECTED
            ? (
              <Label maxFontSizeMultiplier={1.2} font14 center darkGreen>
                <Label>Tap</Label>
                <Label weightSemiBold>{" Send Request "}</Label>
                <Label>below to start pairing again</Label>
              </Label>
            ) : (
              <Label maxFontSizeMultiplier={1.2} font14 center black>
                {responseStr === ACCEPT_PAIRING ? (
                  <Label>
                    <Label>Press</Label>
                    <Label weightSemiBold>{" OK "}</Label>
                    <Label>on your pump to continue</Label>
                  </Label>
                ) : responseStr}
              </Label>
            )
        }
        {
          responseStr === instructionTxt
          && (
            <Label maxFontSizeMultiplier={1.2} font14 center>
              {pump.pumpDevice === C.PUMP_DEVICE.GG2 ? "Press - to reject" : "or press P to reject"}
            </Label>
          )
        }
        {
          responseStr === REJECTED
            ? (
              <View style={Styles.bottomBtn}>
                <ButtonRound
                  style={Styles.sendRqstBtn}
                  onPress={() => this.sendConnectRequest()}
                >
                  <Label white font14 center weightSemiBold>
                    Send Request
                  </Label>
                </ButtonRound>
              </View>
            )
            : (
              <TouchableOpacity
                onPress={this.sendConnectRequest}
                style={Styles.bottomBtn}
              >
                <Label
                  maxFontSizeMultiplier={1.2}
                  blue
                  font14
                  center
                  style={Styles.cantConnectText}
                >
                  Can't connect?
                  {"\n"}
                  Send connection request again
                </Label>
              </TouchableOpacity>
            )
        }
      </Container>
    );
  }
}

Connected.propTypes = {
  navigation: PropTypes.object,
  pump: PropTypes.object,
  sendConnectRequest: PropTypes.func,
  rememberDevice: PropTypes.func,
  addMessage: PropTypes.func,
  status: PropTypes.object,
};

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10
  },
  closeBtnView: {
    marginTop: 50,
    width: 40,
    height: 40,
    alignSelf: "flex-end",
    alignItems: "flex-end",
    paddingRight: 5
  },
  closeIcon: {
    fontSize: 24
  },
  genieImg: {
    marginTop: "22%",
    marginBottom: 10
  },
  sendRqstBtn: {
    backgroundColor: Colors.green,
    width: appWidth * 0.90
  },
  bottomBtn: {
    position: "absolute",
    bottom: 0,
    marginBottom: 15
  },
  cantConnectText: {
    fontWeight: Platform.OS === "android" ? "700" : "600"
  }
});
