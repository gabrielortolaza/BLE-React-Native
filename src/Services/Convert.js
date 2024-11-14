import { MILILITRE } from "../Config/constants";

export function fluidFrom(
  { measureUnit, value, showUnit } = { value: 0, measureUnit: MILILITRE }
) {
  value = value || 0;
  measureUnit = measureUnit || MILILITRE;

  if (typeof value === "string" && value.indexOf(".") === 0) {
    value = `0${value}`;
  }
  if (measureUnit === "us_ounce") {
    value *= 29.5735;
  } else if (measureUnit === "uk_ounce") {
    value *= 28.4131;
  }
  if (!value) {
    value = 0;
  }

  value = Number((value * 1).toFixed(2));
  if (isNaN(value)) {
    value = 0;
  }

  if (showUnit) {
    if (measureUnit === MILILITRE && value >= 1000) {
      value /= 1000;
      value = Number((value * 1).toFixed(2));
      measureUnit = "litre";
    }
    return `${value} ${unit(measureUnit)}`;
  }
  return value;
}

export function fluidTo(
  { measureUnit, value, showUnit } = { value: 0, measureUnit: MILILITRE }
) {
  value = value || 0;
  measureUnit = measureUnit || MILILITRE;

  if (typeof value === "string" && value.indexOf(".") === 0) {
    value = `0${value}`;
  }

  if (measureUnit === "us_ounce") {
    value /= 29.5735;
  } else if (measureUnit === "uk_ounce") {
    value /= 28.4131;
  }

  if (!value) {
    value = 0;
  }

  value = Number((value * 1).toFixed(2));

  if (showUnit) {
    if (measureUnit === MILILITRE && value >= 1000) {
      value /= 1000;
      value = Number((value * 1).toFixed(2));
      measureUnit = "litre";
    }
    return `${value} ${unit(measureUnit)}`;
  }
  return value;
}

export function unit(measureUnit = MILILITRE) {
  if (measureUnit === "uk_ounce" || measureUnit === "us_ounce") {
    return "oz";
  }
  if (measureUnit === "litre") {
    return "L";
  }
  return "mL";
}

export default {
  fluidFrom,
  fluidTo,
  unit
};
