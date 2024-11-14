import React from "react";
import { View, Image } from "react-native";

import { Images } from "../../../Themes";

const ProgramRecordWelcome = () => {
  return (
    <View>
      <Image style={Styles.image} source={Images.supergeniePaired} />
      {/* <View>
        <Label font18 white  center>
          Be ready to adjust mode{'\n'}
          and levels by Super Genie,{'\n'}
          and start recording by{'\n'}
          Record button!
        </Label>
      </View>
      <View style={Styles.gutterDouble} /> */}
    </View>
  );
};

ProgramRecordWelcome.propTypes = {
};

const Styles = {
  image: {
    alignSelf: "center",
    width: "50%",
    resizeMode: "contain"
  },
  gutterDouble: {
    flex: 2,
  },
};

export default ProgramRecordWelcome;
