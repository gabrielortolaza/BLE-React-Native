import React, { useState, useEffect, useCallback } from "react";
import {
  View, TouchableOpacity, StyleSheet
} from "react-native";
import PropTypes from "prop-types";
import Icon from "./Icon";
import { Colors } from "../../Themes";
import Label from "./Label";

const firstPage = 1;

const Pagination = (props) => {
  const {
    listNumber, listLengthPerPage, goPrevPage,
    goNextPage, reachedLastPage
  } = props;

  const [onPage, setOnPage] = useState(firstPage);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const assessPosition = useCallback(() => {
    const displayedNum = onPage * listLengthPerPage;
    if (listNumber > (displayedNum)) {
      setHasNext(true);
    } else {
      setHasNext(false);
    }

    if (onPage !== firstPage) {
      setHasPrev(true);
    } else {
      setHasPrev(false);
    }

    if (
      (onPage === firstPage && displayedNum === listNumber)
      || (onPage > firstPage && displayedNum === listNumber)
    ) {
      reachedLastPage && reachedLastPage();
    }
  }, [listNumber, onPage]);

  useEffect(() => {
    assessPosition();
  }, [listNumber, onPage]);

  if (!listNumber) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.btnsView}>
        <TouchableOpacity
          disabled={!hasPrev}
          onPress={() => {
            const prevPage = onPage - 1;
            setOnPage(prevPage);
            goPrevPage(prevPage);
          }}
          style={styles.arrowLeftView}
        >
          <Icon
            name="chevron-back"
            style={[styles.arrow, hasPrev && styles.leftArrowActive]}
          />
        </TouchableOpacity>
        <Label
          maxFontSizeMultiplier={1}
          font16
          style={styles.paginationText}
        >
          {onPage}
        </Label>
        <TouchableOpacity
          disabled={!hasNext}
          onPress={() => {
            const nextPage = onPage + 1;
            setOnPage(nextPage);
            goNextPage(nextPage);
          }}
          style={[styles.arrowRightView, hasNext && styles.arrowRightViewActive]}
        >
          <Icon
            name="chevron-forward"
            style={[styles.arrow, hasNext && styles.rightArrowActive]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 35
  },
  btnsView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15
  },
  arrowLeftView: {
    borderWidth: 1,
    borderRadius: 2,
    borderColor: Colors.lightGrey300,
    padding: 5
  },
  arrowRightView: {
    borderWidth: 1,
    borderRadius: 2,
    borderColor: Colors.lightGrey300,
    padding: 5
  },
  arrowRightViewActive: {
    borderColor: Colors.blue,
    backgroundColor: Colors.blue
  },
  arrow: {
    fontSize: 20,
    color: Colors.lightGrey2
  },
  leftArrowActive: {
    color: Colors.blue
  },
  rightArrowActive: {
    color: Colors.white
  },
  paginationText: {
    marginHorizontal: 35
  }
});

Pagination.propTypes = {
  listNumber: PropTypes.number.isRequired,
  listLengthPerPage: PropTypes.number.isRequired,
  goPrevPage: PropTypes.func,
  goNextPage: PropTypes.func,
  reachedLastPage: PropTypes.func
};

export default Pagination;
