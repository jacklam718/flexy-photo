// @flow

import React, { PureComponent } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { CustomCachedImage } from 'react-native-img-cache';
// import Comment from './Comment';

const {
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
} = Dimensions.get('window');
const IMAGE_HEIGHT = WINDOW_HEIGHT / 3.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    width: WINDOW_WIDTH,
    height: 200,
    backgroundColor: 'red',
  },
  activeImage: {
    width: WINDOW_WIDTH - 10,
    height: IMAGE_HEIGHT,
    left: 5,
    top: (WINDOW_HEIGHT / 2) - (IMAGE_HEIGHT / 2),
  },
  text: {
    fontSize: 16,
    fontWeight: '200',
    color: '#fff',
    marginLeft: 20,
  },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {
      height: 20,
      width: 15,
    },
  }
});

export default class ParallaxCarousel extends PureComponent {
  scrollX = new Animated.Value(0)

  translateX = new Animated.Value(1)

  // translateY = new Animated.Value(1)

  // opacity = new Animated.Value(0)

  scrollViewHasScrolled = false

  width = WINDOW_WIDTH

  height = WINDOW_HEIGHT

  static defaultProps = {
    speed: 0.5,
  }

  state = {
    selectedIndex: null,
  }

  componentDidMount() {
    const { selectedIndex } = this.props;

    // this.animateTo(1);
    this.setState({ selectedIndex }, () => {
      this.scrollToIndex(selectedIndex);
    });
  }

  // componentWillReceiveProps(nextProps) {
  //   const { selectedIndex, isCloseing } = this.props;
  //   if (selectedIndex !== nextProps.selectedIndex) {
  //     this.setState({ selectedIndex: nextProps.selectedIndex });
  //   }
  //   if (isCloseing !== nextProps.isCloseing) {
  //     this.animateTo(0);
  //   }
  // }
  //
  // animateTo = (toValue) => {
  //   Animated.parallel([
  //     Animated.timing(this.translateY, {
  //       toValue: 0,
  //       duration: 450,
  //     }),
  //     Animated.timing(this.opacity, {
  //       toValue,
  //       duration: 450,
  //     }),
  //   ]).start();
  // }

  getParallaxStyles(index) {
    const { speed } = this.props;
    const horizontalSpeed = Math.abs(this.width * speed - this.width);

    const horizontalStyles = {
      transform: [
        {
          translateX: this.scrollX.interpolate({
            inputRange: [
              (index - 1) * this.width,
              index * (this.width),
              (index + 1) * this.width,
            ],
            outputRange: [-horizontalSpeed, 0, horizontalSpeed],
            extrapolate: 'clamp',
          }),
        },
      ],
    };

    if (speed === 1) {
      return {};
    }

    return horizontalStyles;
  }

  adjustSize = (e) => {
    this.width = e.nativeEvent.layout.width;
    this.height = e.nativeEvent.layout.height;
  }

  handleScroll = (e) => {
    const { onSelectedIndexChange, selectedIndex } = this.props;
    let index = e.nativeEvent.position;

    if (index === undefined) {
      index = Math.round(
        e.nativeEvent.contentOffset.x / this.width,
      );
    }
    if ((selectedIndex - index) === selectedIndex) {
      return;
    }
    if (selectedIndex !== index) {
      onSelectedIndexChange(index);
    }
  }

  scrollToIndex(index) {
    const scrollOffset = this.width * index;

    if (!this.scrollViewHasScrolled) {
      this.scrollX.setValue(scrollOffset);
      this.scrollViewHasScrolled = true;
    }

    this.scrollView._component.scrollTo({
      x: scrollOffset,
      animated: false,
    });
  }

  renderCarousel() {
    const { images, openStyle, isCloseing, selectedIndex } = this.props;
    const shadow = (!isCloseing) ? styles.shadow : null;

    return images.map((uri, index) => {
      let image = null;
      if (selectedIndex === index) {
        image = (
          <CustomCachedImage
            component={Animated.Image}
            resizeMode="cover"
            style={StyleSheet.flatten([styles.activeImage, openStyle])}
            source={{ uri }}
          />
        );
      } else if (
        // 1. reduce lag on render 2. pre-render few images
        images.slice(Math.max(0, selectedIndex - 3), selectedIndex + 3).includes(images[index])
      ) {
        image = (
          <CustomCachedImage
            component={Animated.Image}
            resizeMode="cover"
            style={styles.activeImage}
            source={{ uri }}
          />
        );
      }

      return (
        <View
          key={`carousel-${uri}`}
          style={StyleSheet.flatten([styles.container, shadow])}
        >
          <Animated.View style={this.getParallaxStyles(index)}>
            <View style={styles.content}>
              {image}
            </View>
          </Animated.View>
        </View>
      );
    });
  }

  render() {
    return (
      <Animated.ScrollView
        ref={(ref) => { this.scrollView = ref; }}
        horizontal
        pagingEnabled
        scrollEventThrottle={1}
        onLayout={this.adjustSize}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: this.scrollX } } }],
          {
            useNativeDriver: true,
            listener: this.handleScroll,
          },
        )}
      >
        {this.renderCarousel()}
      </Animated.ScrollView>
    );
  }
}
