import React, { PureComponent } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { CustomCachedImage } from 'react-native-img-cache';
import Toolbar, { LeftElement, RightElement } from './Toolbar';
import FlexyPhoto from './FlexyPhoto';
import Header from './Header';
import ParallaxCarousel from './ParallaxCarousel';
import { images } from '../data';
const data = images.map(uri => ({ key: uri }));

const {
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
} = Dimensions.get('window');
const IMAGE_HEIGHT = WINDOW_HEIGHT / 3.5;
const MAX_HEADER_HEIGHT = WINDOW_HEIGHT / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
    paddingTop: 3,
  },
  grid: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gridItem: {
    width: (WINDOW_WIDTH / 3),
    height: (WINDOW_WIDTH / 3),
  },
  imageContainer: {
    flex: 1,
    width: WINDOW_WIDTH,
  },
  activeImage: {
    width: WINDOW_WIDTH - 10,
    height: IMAGE_HEIGHT,
    left: 5,
    top: (WINDOW_HEIGHT / 2) - (IMAGE_HEIGHT / 2),
  },
  title: {
    color: '#fff',
    padding: 20,
    marginLeft: 50,
  },
  pageOuterContainer: {
    flexDirection: 'row',
    width: WINDOW_WIDTH,
  },
});

export default class GridContainer extends PureComponent {
  scrollX = new Animated.Value(0)

  scrollY = new Animated.Value(0)

  titleAnimate = new Animated.Value(0)

  imageOpacity = new Animated.Value(1)

  photos = []

  state = {
    origin: null,
    isCloseing: false,
  }

  onStateChange = async ({ status }) => {
    if (status === 'opening') {
      const { onOpen } = this.props;
      this.imageOpacity.setValue(0);
      onOpen();
    } else if (status === 'close') {
      const { onClose } = this.props;
      this.imageOpacity.setValue(1);
      onClose();
      this.setState({ origin: null });
    } else if (status === 'open') {
      const { selectedIndex } = this.state;
      const origin = await this.photos[selectedIndex].getOrigin();
      this.setState({ origin });
    }
  }

  handleOpen = (index) => {

    this.setState({
      selectedIndex: index,
      leftItemState: 'close',
      rightItemState: 'more',
      isCloseing: false,
      isActive: true,
    }, () => {
      this.scrollX.setValue(WINDOW_WIDTH * index);
      Animated.timing(this.titleAnimate, {
        toValue: 1,
        duration: 400,
      }).start();
      this.photos[index].show();
    });
  }

  handleClose = (close) => {
    this.setState({
      leftItemState: 'back',
      rightItemState: 'add',
      isActive: false,
      isCloseing: true,
    }, () => {
      close();
      Animated.timing(this.titleAnimate, {
        toValue: 0,
        duration: 400,
      }).start();
    });
  }

  onSelectedIndexChange = async (selectedIndex) => {
    const origin = await this.photos[selectedIndex].getOrigin();
    this.setState({ selectedIndex, origin });
  }

  renderToolbar = ({ close }) => {
    const { isActive, leftItemState, rightItemState } = this.state;
    const leftItem = {
      layout: 'icon',
      icon: (
        <LeftElement
          onPress={() => { this.handleClose(close); }}
          initialIcon="back"
          isActive={isActive}
          iconState={leftItemState}
          states={{ back: 'arrow-back', close: 'close' }}
        />
      ),
    };

    const rightItem = {
      layout: 'icon',
      icon: (
        <RightElement
          iconState={rightItemState}
          initialIcon="add"
          isActive={isActive}
          states={{
            add: 'add',
            more: 'more-vert',
          }}
        />
      ),
    };

    return (
      <Toolbar
        leftItem={leftItem}
        rightItem={rightItem}
      />
    );
  }

  renderCarousel = ({ openStyle }) => {
    const { selectedIndex, isCloseing } = this.state;

    return (
      <ParallaxCarousel
        images={images}
        isCloseing={isCloseing}
        openStyle={openStyle}
        selectedIndex={selectedIndex}
        onSelectedIndexChange={this.onSelectedIndexChange}
        speed={0.5}
      />
    );
  }

  renderGridItem = ({ item, index }) => {
    const { origin, selectedIndex } = this.state;
    return (
      <FlexyPhoto
        key={`image-${item.key}`}
        ref={(ref) => { this.photos[index] = ref; }}
        style={StyleSheet.flatten([
          styles.gridItem,
          selectedIndex === index ? { opacity: this.imageOpacity } : null,
          !(index % 1) ? { paddingTop: 5, paddingRight: 5 } : null,
          !(index % 3) ? { paddingLeft: 5, paddingRight: 5 } : null,
        ])}
        renderHeader={this.renderToolbar}
        renderContent={this.renderCarousel}
        onStateChange={this.onStateChange}
        origin={origin}
      >
        <TouchableWithoutFeedback onPress={() => this.handleOpen(index)}>
          <CustomCachedImage
            component={Animated.Image}
            resizeMode="cover"
            style={styles.image}
            source={{ uri: item.key }}
          />
        </TouchableWithoutFeedback>
      </FlexyPhoto>
    );
  }

  renderHeader() {
    const imageCount = images.length;
    const fontSize = this.scrollY.interpolate({
      inputRange: [0, MAX_HEADER_HEIGHT / 2],
      outputRange: [24, 18],
      extrapolate: 'clamp',
    });
    return (
      <Animated.Text
        style={StyleSheet.flatten([
          styles.title,
          { fontSize },
          {
            transform: [
              {
                translateY: this.titleAnimate.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 50],
                }),
              },
            ],
          },
        ])}
      >
        {`${imageCount} photos`}
      </Animated.Text>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          ref={(ref) => { this.header = ref; }}
          offset={this.scrollY}
        >
          {this.renderHeader()}
        </Header>

        <FlatList
          data={data}
          numColumns={3}
          scrollEventThrottle={1}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: this.scrollY } } }])}
          style={styles.flatList}
          renderItem={this.renderGridItem}
        />
      </View>
    );
  }
}
