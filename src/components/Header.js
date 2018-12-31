import React, { PureComponent, Children } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
  header: {
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
  static MIN_HEADER_HEIGHT = 90
  static MAX_HEADER_HEIGHT = Dimensions.get('window').height / 3;

  render() {
    const { offset, children } = this.props;
    const content = Children.only(children);
    const headerHeight = offset.interpolate({
      inputRange: [0, ScrollHeader.MAX_HEADER_HEIGHT],
      outputRange: [ScrollHeader.MAX_HEADER_HEIGHT, ScrollHeader.MIN_HEADER_HEIGHT],
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
