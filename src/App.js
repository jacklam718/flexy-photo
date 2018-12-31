// @flow

import React, { PureComponent } from 'react';
import { StatusBar, View, StyleSheet, Animated } from 'react-native';
import Toolbar, { LeftElement, RightElement } from './components/Toolbar';
import GridContainer from './components/GridContainer';
import { images } from './data';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default class App extends PureComponent {
  toolbarOpacity = new Animated.Value(1)

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor="black"
          barStyle="light-content"
        />

        <Toolbar
          style={{ opacity: this.toolbarOpacity }}
          leftItem={<LeftElement icon="arrow-back" />}
          rightItem={<RightElement icon="add" />}
        />

        <GridContainer
          images={images}
          onOpen={() => this.toolbarOpacity.setValue(0)}
          onClose={() => this.toolbarOpacity.setValue(1)}
        />
      </View>
    );
  }
}
