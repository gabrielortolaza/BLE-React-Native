import { Platform } from "react-native";

const isiOS = Platform.OS === "ios";
const FontWeights = {
  THIN: "100",
  HAIRLINE: "100",

  EXTRA_LIGHT: "200",
  ULTRA_LIGHT: "200",

  LIGHT: "300",

  NORMAL: "400",
  REGULAR: "400",

  MEDIUM: "500",

  SEMI_BOLD: "600",
  DEMI_BOLD: "600",

  BOLD: "700",

  EXTRA_BOLD: "800",
  ULTRA_BOLD: "800",

  BLACK: "900",
  HEAVY: "900"
};

export const NunitoSansLight = {
  fontFamily: "NunitoSans-Light",
  fontWeight: FontWeights.LIGHT
};

export const NunitoSans = {
  fontFamily: "NunitoSans-Regular",
  fontWeight: FontWeights.REGULAR
};

export const NunitoSansBold = {
  fontFamily: "NunitoSans-Bold",
  fontWeight: isiOS ? FontWeights.BOLD : FontWeights.REGULAR
};

export const NunitoSansSemiBold = {
  fontFamily: "NunitoSans-SemiBold",
  fontWeight: isiOS ? FontWeights.SEMI_BOLD : FontWeights.REGULAR
};

export const OpenSansLight = {
  fontFamily: "OpenSans-Light",
  fontWeight: FontWeights.LIGHT
};

export const OpenSansSemiBold = {
  fontFamily: "OpenSans-SemiBold",
  fontWeight: isiOS ? FontWeights.SEMI_BOLD : FontWeights.REGULAR
};

export const OpenSansBold = {
  fontFamily: "OpenSans-Bold",
  fontWeight: isiOS ? FontWeights.BOLD : FontWeights.REGULAR
};

export const AvenirNextSemiBold = {
  fontFamily: isiOS ? "Avenir Next" : "AvenirNext-DemiBold",
  fontWeight: isiOS ? FontWeights.SEMI_BOLD : FontWeights.REGULAR
};

const Graphik = {
  fontFamily: "Graphik-Regular",
};

const GraphikLight = {
  fontFamily: "Graphik-Light",
};

const GraphikSemiBold = {
  fontFamily: "Graphik-Semibold",
};

const GraphikBold = {
  fontFamily: "Graphik-Bold"
};

const Regular = {
  fontFamily: "Poppins-Regular",
};

const Light = {
  fontFamily: "Poppins-Light",
};

const Medium = {
  fontFamily: "Poppins-Medium",
};

const SemiBold = {
  fontFamily: "Poppins-SemiBold",
};

const Bold = {
  fontFamily: "Poppins-Bold",
};

const Fonts = {
  Regular,
  Light,
  Medium,
  SemiBold,
  Bold,
  // below fonts are not used
  Graphik,
  GraphikLight,
  GraphikSemiBold,
  GraphikBold,
  NunitoSansLight,
  NunitoSans,
  NunitoSansBold,
  NunitoSansSemiBold,
  OpenSansLight,
  OpenSansBold,
  OpenSansSemiBold,
  AvenirNextSemiBold
};

export default Fonts;

/*
  Objective C Fonts debug

for (NSString *familyName in [UIFont familyNames]){
    NSLog(@"Family name: %@", familyName);
    for (NSString *fontName in [UIFont fontNamesForFamilyName:familyName]) {
        NSLog(@"--Font name: %@", fontName);
    }
}
*/
