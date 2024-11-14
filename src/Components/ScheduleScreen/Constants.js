import { Dimensions, PixelRatio } from "react-native";
import moment from "moment";
import { calculate } from "../../Proportional";

const hoursColumnBaseWidth = 62;
export const screenHeight = Dimensions.get("screen").height;
export const screenWidth = Dimensions.get("screen").width;
export const dayColumnWidth = PixelRatio.roundToNearestPixel((Dimensions.get("screen").width - hoursColumnBaseWidth) / 7);

export const hoursColumnWidth = Dimensions.get("screen").width - (dayColumnWidth * 7);

export const hourRowHeightOriginal = 72;
export const hourRowHeight = calculate(hourRowHeightOriginal);
export const hourSubRowDuration = 15;
export const hourSubRowHeight = hourRowHeight / (60 / hourSubRowDuration);
export const hours = [];
for (let i = 0; i < 24; i++) {
  hours.push(moment().hour(i).format("h A"));
}

export const weekHeaderHeight = 75;

export const markMenuHeight = 180 + 14;
export const markMenuWidth = 106 + 14;
export const markMenuOffset = 20;

export const markMenuMarkItemWidthDifference = (markMenuWidth - dayColumnWidth) / 2;
