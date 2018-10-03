import React, { PureComponent, Children } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const MIN_HEADER_HEIGHT = 90;
const MAX_HEADER_HEIGHT = WINDOW_HEIGHT / 3;

const styles = StyleSheet.create({
  header: {
    // flex: 1,
    height: 300,
    width: '100%',
    backgroundColor: '#45728A',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 1,
    shadowOffset: {
      height: 2,
      width: 0.5,
    },
  },
  title: {
    color: '#fff',
    padding: 20,
    marginLeft: 50,
  },
});

export default class ScrollHeader extends PureComponent {
  render() {
    const { offset, children } = this.props;
    const content = Children.only(children);
    const headerHeight = offset.interpolate({
      inputRange: [0, MAX_HEADER_HEIGHT],
      outputRange: [MAX_HEADER_HEIGHT, MIN_HEADER_HEIGHT],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={StyleSheet.flatten([
          styles.header,
          { height: headerHeight },
        ])}
      >
        {content}
      </Animated.View>
    );
  }
}
