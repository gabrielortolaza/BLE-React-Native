import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  View, StyleSheet, ScrollView
} from "react-native";
import { useSelector } from "react-redux";
import moment from "moment";
import Modal from "react-native-modal";

import Label from "../Label";
import ButtonRound from "../ButtonRound";
import Icon from "../Icon";
import { Colors, Images } from "../../../Themes";
import ButtonSelect from "./ButtonSelect";
import DataSwitch from "./DataSwitch";
import DatePicker from "./DatePicker";
import {
  ALL_DATA_TYPE, PUMP_DATA_TYPE, NURSE_DATA_TYPE,
  STASH_DATA_TYPE, XLSX, CSV, ALL_RANGE_START_AT,
  ALL_RANGE_DATE_FORMAT
} from "../../../Config/constants";

const ALL_RANGE = "All";
const LAST_WEEK_RANGE = "Last Week";
const LAST_MONTH_RANGE = "Last Month";
const CUSTOM_RANGE = "Custom";

const ExportLogsStash = (props) => {
  const [selectedFileType, selectFileType] = useState(XLSX.toUpperCase());
  const [selectedAllData, selectAllData] = useState(false);
  const [selectedPumpedData, selectPumpData] = useState(false);
  const [selectedNursedData, selectNurseData] = useState(false);
  const [selectedStashData, selectStashData] = useState(false);
  const [selectedDateRange, selectDateRange] = useState(ALL_RANGE);
  const [dateStartAt, setDateStartAt] = useState(moment(ALL_RANGE_START_AT, ALL_RANGE_DATE_FORMAT).format("x") * 1);
  const [dateEndAt, setDateEndAt] = useState(moment().endOf("day").format("x") * 1);
  const [errorMsg, setErrorMsg] = useState(null);

  const { onClose, exportData } = props;
  const profile = useSelector((state) => state.auth.profile);

  useEffect(() => {
    selectData(true, ALL_DATA_TYPE);
  }, []);

  useEffect(() => {
    if (selectedPumpedData && selectedNursedData && selectedStashData && !selectedAllData) {
      selectAllData(true);
    }

    if (selectedAllData && (!selectedPumpedData || !selectedNursedData || !selectedStashData)) {
      selectAllData(false);
    }
  }, [selectedAllData, selectedPumpedData, selectedNursedData, selectedStashData]);

  const selectData = (val, type) => {
    switch (type) {
      case ALL_DATA_TYPE:
        selectAllData(val);
        selectPumpData(val);
        selectNurseData(val);
        selectStashData(val);
        break;
      case PUMP_DATA_TYPE:
        selectPumpData(val);
        break;
      case NURSE_DATA_TYPE:
        selectNurseData(val);
        break;
      case STASH_DATA_TYPE:
        selectStashData(val);
        break;
      default:
        break;
    }
  };

  const onSelectDateRange = (range) => {
    switch (range) {
      case ALL_RANGE:
        setDateStartAt(moment(ALL_RANGE_START_AT, ALL_RANGE_DATE_FORMAT).format("x") * 1);
        setDateEndAt(moment().endOf("day").format("x") * 1);
        break;
      case LAST_WEEK_RANGE:
        setDateStartAt(moment().startOf("day").subtract(7, "days").format("x") * 1);
        setDateEndAt(moment().endOf("day").format("x") * 1);
        break;
      case LAST_MONTH_RANGE:
        setDateStartAt(moment().startOf("day").subtract(1, "month").format("x") * 1);
        setDateEndAt(moment().endOf("day").format("x") * 1);
        break;
      default:
        break;
    }

    selectDateRange(range);
  };

  const onExportData = () => {
    if (dateStartAt >= dateEndAt) {
      setErrorMsg("Start date can't be greater than or equal to end date");
      return;
    }

    const dataTypeArr = [
      (selectedAllData && ALL_DATA_TYPE),
      (selectedPumpedData && PUMP_DATA_TYPE),
      (selectedNursedData && NURSE_DATA_TYPE),
      (selectedStashData && STASH_DATA_TYPE)
    ].filter((n) => n);

    exportData(
      {
        exportType: selectedFileType.toLowerCase(),
        dataTypeArr,
        startAt: dateStartAt,
        endAt: dateEndAt,
        profileName: profile.displayName ? profile.displayName.split(" ").shift() : "Mama"
      }
    );

    onClose();
  };

  return (
    <Modal
      isVisible
      style={styles.modal}
      onBackdropPress={onClose}
    >
      <View style={styles.container}>
        <ScrollView>
          <View
            style={styles.headerView}
          >
            <Label weightSemiBold font16>
              Export
            </Label>
            <Icon
              name="close"
              style={styles.closeIcon}
              onPress={onClose}
            />
          </View>
          <Label
            style={styles.fileTypeText}
            font12
            weightSemiBold
          >
            FILE TYPE
          </Label>
          <View style={styles.fileTypeBtnsView}>
            <ButtonSelect
              text={XLSX.toUpperCase()}
              onSelect={selectFileType}
              active={selectedFileType === XLSX.toUpperCase()}
            />
            <ButtonSelect
              text={CSV.toUpperCase()}
              onSelect={selectFileType}
              active={selectedFileType === CSV.toUpperCase()}
              style={styles.selectBtn}
            />
          </View>
          <Label font12 weightSemiBold>
            SELECT DATA TO EXPORT
          </Label>
          <View>
            <DataSwitch
              imgSrc={Images.dataUsage}
              title={ALL_DATA_TYPE}
              selected={selectedAllData}
              onValueChange={(val) => selectData(val, ALL_DATA_TYPE)}
              containerStyle={styles.dataSwitch}
            />
            <DataSwitch
              imgSrc={Images.pumpIcon}
              title={PUMP_DATA_TYPE}
              selected={selectedPumpedData}
              onValueChange={(val) => selectData(val, PUMP_DATA_TYPE)}
              containerStyle={styles.dataSwitch}
            />
            <DataSwitch
              imgSrc={Images.feedIcon}
              title={NURSE_DATA_TYPE}
              selected={selectedNursedData}
              onValueChange={(val) => selectData(val, NURSE_DATA_TYPE)}
              containerStyle={styles.dataSwitch}
            />
            <DataSwitch
              imgSrc={Images.addedIcon}
              title={STASH_DATA_TYPE}
              selected={selectedStashData}
              onValueChange={(val) => selectData(val, STASH_DATA_TYPE)}
              containerStyle={styles.dataSwitch}
            />
          </View>
          <Label style={styles.dateRangeText} font12 weightSemiBold>
            DATE RANGE
          </Label>
          <View style={styles.dateRangeView}>
            <ButtonSelect
              text={ALL_RANGE}
              onSelect={onSelectDateRange}
              active={selectedDateRange === ALL_RANGE}
            />
            <ButtonSelect
              text={LAST_WEEK_RANGE}
              onSelect={onSelectDateRange}
              active={selectedDateRange === LAST_WEEK_RANGE}
              style={styles.selectBtn}
            />
            <ButtonSelect
              text={LAST_MONTH_RANGE}
              onSelect={onSelectDateRange}
              active={selectedDateRange === LAST_MONTH_RANGE}
              style={styles.selectBtn}
            />
            <ButtonSelect
              text={CUSTOM_RANGE}
              onSelect={onSelectDateRange}
              active={selectedDateRange === CUSTOM_RANGE}
              style={styles.selectBtn}
            />
          </View>
          {selectedDateRange === CUSTOM_RANGE && (
            <View style={styles.datePickerView}>
              <DatePicker
                dateAt={dateStartAt}
                onChange={(date) => setDateStartAt(moment(date).startOf("day").format("x") * 1)}
              />
              <Label
                font14
                style={styles.dateRangeSpace}
              >
                -
              </Label>
              <DatePicker
                dateAt={dateEndAt}
                onChange={(date) => setDateEndAt(moment(date).endOf("day").format("x") * 1)}
              />
            </View>
          )}
          {errorMsg && (
            <Label
              center
              red
              font11
              maxFontSizeMultiplier={1}
              style={styles.errorMsg}
            >
              {errorMsg}
            </Label>
          )}
          <ButtonRound
            onPress={onExportData}
            disabled={
              !selectedFileType
              || !(selectedAllData || selectedPumpedData || selectedNursedData || selectedStashData)
            }
            style={styles.exportBtn}
          >
            <Label white font14 weightSemiBold>Export</Label>
          </ButtonRound>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0
  },
  container: {
    paddingHorizontal: 15,
    backgroundColor: Colors.white,
    borderRadius: 12
  },
  headerView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20
  },
  closeIcon: {
    fontSize: 20,
    color: Colors.lightGrey2
  },
  fileTypeText: {
    marginTop: 15
  },
  fileTypeBtnsView: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10
  },
  selectBtn: {
    marginLeft: 10
  },
  dataSwitch: {
    marginTop: 15
  },
  dateRangeText: {
    marginTop: 15
  },
  dateRangeView: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    flexWrap: "wrap"
  },
  dateRangeSpace: {
    marginTop: 8
  },
  datePickerView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 13
  },
  exportBtn: {
    marginVertical: 17,
    backgroundColor: Colors.blue
  },
  errorMsg: {
    marginTop: 5
  }
});

ExportLogsStash.propTypes = {
  onClose: PropTypes.func,
  exportData: PropTypes.func
};

export default ExportLogsStash;
