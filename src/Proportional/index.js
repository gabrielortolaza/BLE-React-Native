import {
  Dimensions,
  PixelRatio,
  StyleSheet
} from "react-native";

const stylePropsToFix = [
  "",

  // Position
  "top",
  "right",
  "bottom",
  "left",

  // Size
  "height",
  "minHeight",
  "maxHeight",
  "width",
  "minWidth",
  "maxWidth",

  // Padding
  "padding",
  "paddingHorizontal",
  "paddingVertical",
  "paddingTop",
  "paddingLeft",
  "paddingBottom",
  "paddingRight",

  // Margin
  "margin",
  "marginHorizontal",
  "marginVertical",
  "marginTop",
  "marginLeft",
  "marginBottom",
  "marginRight",

  // Border
  "borderBottomEndRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "borderBottomStartRadius",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderRadius",
  "borderRightWidth",
  "borderTopEndRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderTopStartRadius",
  "borderTopWidth",
  "borderWidth",

  // Text
  "fontSize",
  "lineHeight",
  "textShadowOffset",
  "textShadowRadius",

  // Shadows
  "shadowRadius",
  "shadowOffset",
  ""
];

export const calculate = (value, proportion = getProportion()) => PixelRatio.roundToNearestPixel(value * proportion);

export const compile = (style, proportion) => {
  if (style) { // Might be null for images
    if (!style.__skipProportion && !style.__proportion && proportion !== 1) {
      Object.keys(style).map((styleProp) => {
        if (stylePropsToFix.indexOf(styleProp) > 0) {
          const typeOfIt = typeof style[styleProp];
          if (typeOfIt === "number") {
            style[styleProp] = calculate(style[styleProp], proportion);
          } else if (typeOfIt === "object") {
            style[styleProp] = compile(style[styleProp]);
          }
        }
      });
    } else if (style.__proportion) {
      style = style.__proportion(style, proportion);
    }
    delete style.__proportion;
    delete style.__skipProportion;
  }
  return style;
};

export const getProportion = (referenceSize = 375) => Dimensions.get("screen").width / referenceSize;

const createProportional = (styleObject, referenceSize) => {
  const proportion = getProportion(referenceSize);
  Object.keys(styleObject).map((styleName) => {
    styleObject[styleName] = compile(styleObject[styleName], proportion);
  });
  return StyleSheet.create(styleObject);
};

export default {
  ...StyleSheet,
  createProportional
};
