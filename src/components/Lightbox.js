// @flow

import React, { Component } from 'react';
import {
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BlurView } from 'react-native-blur';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;
const IMAGE_HEIGHT = WINDOW_HEIGHT / 3.5;

type Props = {
  isOpen: boolean;
  thumbnailSizeAndPageXY: {
    width: number;
    height: number;
    pageX: number;
    pageY: number;
  };
  renderHeader?: (params?: {
    close: () => void,
  }) => void;
  renderContent?: (params?: {
    openStyle: {
      top: Animated.Value;
      left: Animated.Value;
      width: Animated.Value;
      height: Animated.Value;
    }
  }) => void;
  onDidOpen: () => void;
  onOpening: () => void;
  onClosing: () => void;
  onDidClose: () => void;
}

export default class Lightbox extends Component<Props> {
  size = new Animated.ValueXY()
  position = new Animated.ValueXY()
  opacity = new Animated.Value(0)

  componentWillReceiveProps(nextProps) {
    if (nextProps.isOpen !== this.props.isOpen) {
      if (nextProps.isOpen) {
        this.open();
        return;
      }
      this.close();
    }
  }

  open = async () => {
    const { thumbnailSizeAndPageXY, onOpening, onDidOpen } = this.props;

    // set the size same as thumbnailSizeAndPageXY image size
    this.size.setValue({
      x: thumbnailSizeAndPageXY.width,
      y: thumbnailSizeAndPageXY.height,
    });
    // set the position same as thumbnailSizeAndPageXY image position
    this.position.setValue({
      x: thumbnailSizeAndPageXY.pageX,
      y: thumbnailSizeAndPageXY.pageY,
    });

    onOpening();
    Animated.parallel([
      Animated.spring(this.position.x, {
        toValue: 5,
        friction: 4,
        tension: 15,
      }),
      Animated.spring(this.position.y, {
        toValue: (WINDOW_HEIGHT / 2) - (IMAGE_HEIGHT / 2),
        friction: 4,
        tension: 15,
      }),
      Animated.spring(this.size.x, {
        toValue: WINDOW_WIDTH - 10,
        friction: 4,
        tension: 15,
      }),
      Animated.spring(this.size.y, {
        toValue: IMAGE_HEIGHT,
        friction: 4,
        tension: 15,
      }),
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 450,
        // delay: 100,
      }),
    ]).start(onDidOpen);
  }

  close = () => {
    const { thumbnailSizeAndPageXY, onOpening, onDidClose } = this.props;

    onOpening();
    Animated.parallel([
      Animated.timing(this.position.x, {
        toValue: thumbnailSizeAndPageXY.pageX,
        duration: 300,
      }),
      Animated.timing(this.position.y, {
        toValue: thumbnailSizeAndPageXY.pageY,
        duration: 300,
      }),
      Animated.timing(this.size.x, {
        toValue: thumbnailSizeAndPageXY.width,
        duration: 300,
      }),
      Animated.timing(this.size.y, {
        toValue: thumbnailSizeAndPageXY.height,
        duration: 300,
      }),
      Animated.timing(this.opacity, {
        toValue: 0,
        duration: 450,
        // delay: 50,
      }),
    ]).start(onDidClose);
  }

  render() {
    const {
      isOpen,
      renderHeader,
      renderContent,
    } = this.props;

    const openStyle = {
      top: this.position.y,
      left: this.position.x,
      width: this.size.x,
      height: this.size.y,
    };

    return (
      <Modal visible={isOpen} transparent>
        <Animated.View
          style={StyleSheet.flatten([
            StyleSheet.absoluteFill,
            { opacity: this.opacity },
          ])}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={50}
          />
        </Animated.View>

        {renderHeader({ close: this.close })}
        {renderContent({ openStyle })}
      </Modal>
    );
  }
}
