// @flow

import React, { Component, ReactElement } from 'react';
import { View, TouchableWithoutFeedback, Animated } from 'react-native';
import Lightbox from './Lightbox';
import uiMeasure from './uiMeasure';

type Props = {
  style?: any;
  origin?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  renderHeader?: () => ReactElement;
  renderContent?: () => ReactElement;
  onStateChange?: (
    state: 'IMAGE_OPENING' | 'IMAGE_OPENED' | 'IMAGE_DIMISSING' | 'IMAGE_DISMISSED'
  ) => void;
  children: any;
}

export default class FlexyPhoto extends Component<Props> {
  static defaultProps = {
    style: null,
    origin: null,
    renderHeader: () => {},
    renderContent: () => {},
    onStateChange: () => {},
  }

  state = {
    isOpen: false,
    origin: null,
  }

  show = async () => {
    const {
      pageX,
      pageY,
      width,
      height,
    } = await uiMeasure(this.image);

    this.setState({
      origin: {
        pageX,
        pageY,
        width,
        height,
      },
    }, () => {
      this.setState({ isOpen: true });
    });
  }

  close = () => {
    this.setState({ isOpen: false });
  }

  onClose = () => {
    this.setState({ isOpen: false });
  }

  async getOrigin() {
    return uiMeasure(this.image);
  }

  render() {
    const {
      style,
      children,
      renderHeader,
      renderContent,
      onStateChange,
    } = this.props;

    const { isOpen } = this.state;

    const origin = this.props.origin || this.state.origin;

    return (
      <Animated.View style={style}>
        <TouchableWithoutFeedback onPress={this.show}>
          <View ref={(component) => { this.image = component; }}>
            {children}
          </View>
        </TouchableWithoutFeedback>

        <Lightbox
          isOpen={isOpen}
          origin={origin}
          renderHeader={renderHeader}
          onClose={this.onClose}
          onStateChange={onStateChange}
          renderContent={renderContent}
        />
      </Animated.View>
    );
  }
}
