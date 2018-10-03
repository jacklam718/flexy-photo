// @flow

import React, { PureComponent } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import NavigationBar from './components/NavigationBar';
import GridContainer from './components/GridContainer';
import { images } from './data';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default class App extends PureComponent {
  onImageOpen = () => {
    this.navigationBar.hide();
  }

  onImageClose = () => {
    this.navigationBar.show();
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor="black"
          barStyle="light-content"
        />

        <NavigationBar
          ref={(ref) => { this.navigationBar = ref; }}
        />

        <GridContainer
          images={images}
          onOpen={this.onImageOpen}
          onClose={this.onImageClose}
        />
      </View>
    );
  }
}
