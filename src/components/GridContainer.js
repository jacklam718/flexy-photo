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

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = WINDOW_HEIGHT / 3.5;

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
  scrollY = new Animated.Value(0)
  titleAnimate = new Animated.Value(0)
  imageOpacity = new Animated.Value(1)
  photos = []
  state = {
    thumbnailSizeAndPageXY: null,
    isOpen: false,
  }

  handleOpen = (index) => {
    this.setState({
      selectedIndex: index,
      leftItemState: 'close',
      rightItemState: 'more',
      isOpen: true,
    }, () => {
      this.photos[index].show();
      Animated.timing(this.titleAnimate, {
        toValue: 1,
        duration: 400,
      }).start();
    });
  }

  handleClose = (close) => {
    this.setState({
      leftItemState: 'back',
      rightItemState: 'add',
      isOpen: false,
    }, () => {
      close();
      Animated.timing(this.titleAnimate, {
        toValue: 0,
        duration: 400,
      }).start();
    });
  }

  handleImageOpening = () => {
    this.imageOpacity.setValue(0); // set thumbnail invisible
    this.props.onOpen();
  }

  handleImageDidClose = () => {
    this.imageOpacity.setValue(1); // set thumbnail visible
    this.props.onClose();
    this.setState({ thumbnailSizeAndPageXY: null });
  }

  handleImageDidOpen = async () => {
    const { selectedIndex } = this.state;
    const thumbnailSizeAndPageXY = await this.photos[selectedIndex].getThumbnailSizeAndPageXY();
    this.setState({ thumbnailSizeAndPageXY });
  }

  handleSelectedIndexChange = async (selectedIndex) => {
    const thumbnailSizeAndPageXY = await this.photos[selectedIndex].getThumbnailSizeAndPageXY();
    this.setState({ selectedIndex, thumbnailSizeAndPageXY });
  }

  renderToolbar = ({ close }) => {
    const { isOpen, leftItemState, rightItemState } = this.state;

    return (
      <Toolbar
        leftItem={
          <LeftElement
            onPress={() => { this.handleClose(close); }}
            initialIcon="back"
            isActive={isOpen}
            iconState={leftItemState}
            states={{
              back: 'arrow-back',
              close: 'close'
            }}
          />
        }
        rightItem={
          <RightElement
            iconState={rightItemState}
            initialIcon="add"
            isActive={isOpen}
            states={{
              add: 'add',
              more: 'more-vert'
            }}
          />
        }
      />
    );
  }

  renderCarousel = ({ openStyle }) => {
    const { images } = this.props;
    const { selectedIndex } = this.state;

    return (
      <ParallaxCarousel
        images={images}
        openStyle={openStyle}
        selectedIndex={selectedIndex}
        onSelectedIndexChange={this.handleSelectedIndexChange}
        speed={0.5}
      />
    );
  }

  renderGridItem = ({ item, index }) => {
    const { thumbnailSizeAndPageXY, selectedIndex } = this.state;
    const opacity = selectedIndex === index ? { opacity: this.imageOpacity } : null;
    const padding = {
      ...!(index % 1) ? { paddingTop: 5, paddingRight: 5 } : null,
      ...!(index % 3) ? { paddingLeft: 5, paddingRight: 5 } : null,
    }
    return (
      <FlexyPhoto
        key={`image-${item.key}`}
        ref={(ref) => { this.photos[index] = ref; }}
        style={StyleSheet.flatten([styles.gridItem, opacity, padding])}
        onImageOpening={this.handleImageOpening}
        onImageDidClose={this.handleImageDidClose}
        onImageDidOpen={this.handleImageDidOpen}
        renderHeader={this.renderToolbar}
        renderContent={this.renderCarousel}
        thumbnailSizeAndPageXY={thumbnailSizeAndPageXY}
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
    const { images } = this.props;
    const imageCount = images.length;
    const fontSize = this.scrollY.interpolate({
      inputRange: [0, Header.MAX_HEADER_HEIGHT / 2],
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
    const images = this.props.images.map(uri => ({ key: uri }));

    return (
      <View style={styles.container}>
        <Header offset={this.scrollY}>
          {this.renderHeader()}
        </Header>

        <FlatList
          data={images}
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
