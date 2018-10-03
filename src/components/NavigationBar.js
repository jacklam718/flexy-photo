// @flow

import React, { PureComponent } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Toolbar, { LeftElement, RightElement } from './Toolbar';

const styles = StyleSheet.create({
  toolbar: {
    height: 100,
    zIndex: 1000,
    backgroundColor: 'transparent',
    position: 'absolute',
    width: '100%',
  },
});

export default class NavigationBar extends PureComponent {
  toolbarOpacity = new Animated.Value(1)

  show() {
    this.toolbarOpacity.setValue(1);
  }

  hide() {
    this.toolbarOpacity.setValue(0);
  }

  render() {
    return (
      <Toolbar
        style={{ opacity: this.toolbarOpacity }}
        leftItem={{
          layout: 'icon',
          icon: (
            <LeftElement
              icon="arrow-back"
            />
          ),
        }}
        rightItem={{
          layout: 'icon',
          icon: (
            <RightElement
              icon="add"
            />
          )
        }}
      />
    );
  }
}
