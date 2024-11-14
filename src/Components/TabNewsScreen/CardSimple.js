import React, { PureComponent } from "react";
import {
  View, ImageBackground, TouchableOpacity
} from "react-native";
import PropTypes from "prop-types";
import { Label, CustomIcon } from "../Shared";
import { Colors } from "../../Themes";
import Icon from "../Shared/Icon";

export default class CardSimple extends PureComponent {
  render() {
    const {
      style, title, subtitle,
      subtitleSmall, subtitleBig, link,
      source, textColor, children,
      subtitleUnit, linkPress, subtitleBigUnit,
      wide, icon, image, type, subtitleBottom,
      showStashAlert
    } = this.props;

    return (
      wide ? (
        <ImageBackground
          imageStyle={Styles.outerViewImage}
          style={[Styles.outerView, style]}
          source={source}
        >
          <View style={Styles.header}>
            {image ? (
              <CustomIcon image={image} customStyles={Styles.image} />
            ) : (
              <Icon
                type={type ?? "FontAwesome"}
                name={icon}
                style={Styles.icon}
              />
            )}
            <Label
              textColor={textColor}
              style={Styles.title}
              font16
              weightBold
            >
              {title}
            </Label>
          </View>
          <Label
            textColor={textColor}
            weightBold
            mt10
            font20
            maxFontSizeMultiplier={1.1}
          >
            {children || subtitle}
            <Label white font20>{subtitleUnit || ""}</Label>
          </Label>
          <View style={Styles.subtitleContainer}>
            <Label
              textColor={textColor}
              font20
              weightBold
              maxFontSizeMultiplier={1.1}
            >
              {subtitleBig}
              <Label white font16 maxFontSizeMultiplier={1.1}>
                {` ${subtitleBigUnit}` || ""}
              </Label>
            </Label>
            {
              link && (
                <TouchableOpacity
                  onPress={() => linkPress()}
                >
                  <Label
                    textColor={textColor}
                    style={Styles.link}
                    weightBold
                  >
                    {link}
                  </Label>
                </TouchableOpacity>
              )
            }
          </View>
        </ImageBackground>
      ) : (
        <ImageBackground
          imageStyle={Styles.outerViewImage}
          style={[Styles.outerView, style]}
          source={source}
        >
          {image ? (
            <CustomIcon image={image} customStyles={Styles.image} />
          ) : (
            <Icon
              type={type ?? "MaterialIcons"}
              name={icon}
              style={Styles.icon}
            />
          )}
          <Label
            textColor={textColor}
            style={Styles.title}
            font16
            weightBold
            maxFontSizeMultiplier={1.1}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {title}
          </Label>
          { (subtitle || children) && (
            <View style={Styles.subtitleWrapper}>
              {showStashAlert && (
                <Icon
                  name="alert"
                  type="MaterialCommunityIcons"
                  style={Styles.infoIcon}
                />
              )}
              <Label
                textColor={textColor}
                font20
                weightBold
                maxFontSizeMultiplier={1.1}
              >
                {children || subtitle}
                <Label white font20>{subtitleUnit || ""}</Label>
              </Label>
            </View>
          )}
          { subtitleBottom && (
            <Label
              textColor={textColor}
              font20
              weightBold
              maxFontSizeMultiplier={1.2}
            >
              {subtitleBottom}
              <Label white font20>{subtitleUnit || ""}</Label>
            </Label>
          )}
          {
            subtitleSmall && (
              <Label
                textColor={textColor}
                font12
                maxFontSizeMultiplier={1.1}
              >
                {subtitleSmall}
              </Label>
            )
          }
          {
            subtitleBig && (
              <Label
                textColor={textColor}
                font16
                weightBold
                maxFontSizeMultiplier={1}
              >
                {subtitleBig}
                <Label white font16 maxFontSizeMultiplier={1}>
                  {` ${subtitleBigUnit}` || ""}
                </Label>
              </Label>
            )
          }
          {
            link && (
              <TouchableOpacity
                style={Styles.linkContainer}
                onPress={() => linkPress()}
              >
                <Label
                  textColor={textColor}
                  style={Styles.link}
                  font14
                  weightBold
                >
                  {link}
                </Label>
              </TouchableOpacity>
            )
          }
        </ImageBackground>
      )
    );
  }
}

CardSimple.propTypes = {
  style: PropTypes.object,
  title: PropTypes.string,
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subtitleBottom: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.element]),
  subtitleSmall: PropTypes.string,
  subtitleBig: PropTypes.string,
  link: PropTypes.string,
  source: PropTypes.number,
  textColor: PropTypes.string,
  children: PropTypes.any,
  subtitleUnit: PropTypes.string,
  subtitleBigUnit: PropTypes.string,
  linkPress: PropTypes.func,
  wide: PropTypes.bool,
  type: PropTypes.string,
  image: PropTypes.number,
  icon: PropTypes.string,
  showStashAlert: PropTypes.bool,
};

const Styles = {
  header: {
    flexDirection: "row",
    alignItems: "center"
  },
  title: {
    marginBottom: "auto"
  },
  subtitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  linkContainer: { marginBottom: 10 },
  link: {
    textDecorationLine: "underline"
  },
  image: {
    marginBottom: 3,
    width: 24,
    height: 24,
  },
  icon: {
    fontSize: 25,
    color: Colors.white,
    marginRight: 10,
    marginBottom: 3,
  },
  outerViewImage: { borderRadius: 8 },
  outerView: {
    padding: 10,
    // borderWidth: 0.5,
    // borderColor: Colors.lightGrey
  },
  subtitleWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 5,
    color: Colors.white
  },
};
