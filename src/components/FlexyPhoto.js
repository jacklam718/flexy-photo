// @flow

import React, { Component, ReactElement } from 'react';
import { View, TouchableWithoutFeedback, Animated, findNodeHandle } from 'react-native';
import RCTUIManager from 'NativeModules';
import Lightbox from './Lightbox';

type Props = {
  style?: any;
  origin?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  children: any;
  renderHeader?: () => ReactElement;
  renderContent?: () => ReactElement;
}

export default class FlexyPhoto extends Component<Props> {
  static defaultProps = {
    style: null,
    thumbnailSizeAndPageXY: null,
    renderHeader: () => {},
    renderContent: () => {},
  }

  state = {
    isOpen: false,
    thumbnailSizeAndPageXY: null,
  }

  show = async () => {
    const thumbnailSizeAndPageXY = await this.getThumbnailSizeAndPageXY();
    this.setState({ thumbnailSizeAndPageXY }, () => {
      this.setState({ isOpen: true }, this.props.onImageDidOpen);
    });
  }

  onDidClose = () => {
    this.setState({ isOpen: false }, this.props.onImageDidClose);
  }

  async getThumbnailSizeAndPageXY() {
    return new Promise((resolve, reject) => {
      const handle = findNodeHandle(this.image);
      RCTUIManager.UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
        resolve({ width, height, pageX, pageY });
      });
    })
  }

  render() {
    const {
      style,
      children,
      onImageOpening,
      renderHeader,
      renderContent,
    } = this.props;
    const { isOpen } = this.state;
    const thumbnailSizeAndPageXY = this.props.thumbnailSizeAndPageXY || this.state.thumbnailSizeAndPageXY;

    return (
      <Animated.View style={style}>
        <TouchableWithoutFeedback onPress={this.show}>
          <View ref={(component) => { this.image = component; }}>
            {children}
          </View>
        </TouchableWithoutFeedback>

        <Lightbox
          isOpen={isOpen}
          thumbnailSizeAndPageXY={thumbnailSizeAndPageXY}
          onOpening={onImageOpening}
          onDidClose={this.onDidClose}
          renderHeader={renderHeader}
          renderContent={renderContent}
        />
      </Animated.View>
    );
  }
}
