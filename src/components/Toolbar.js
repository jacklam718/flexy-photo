// @flow

import React, { PureComponent } from 'react';
import {
  Platform,
  View,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

const isIphoneX = Platform.OS === 'ios' && (WINDOW_HEIGHT === 812 || WINDOW_WIDTH === 812);

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : 25;
const HEADER_HEIGHT = isIphoneX ? 100 : (Platform.OS === 'ios' ? 44 + STATUS_BAR_HEIGHT : 56 + STATUS_BAR_HEIGHT);

const styles = StyleSheet.create({
  toolbar: {
    zIndex: 1000,
    backgroundColor: 'transparent',
    paddingTop: STATUS_BAR_HEIGHT,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
  },
  titleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  leftItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerItem: {
    flex: 2,
    alignItems: 'center',
  },
  rightItem: {
    flex: 1,
    alignItems: 'flex-end',
  },
  itemWrapper: {
    padding: 11,
  },
  itemText: {
    letterSpacing: 1,
    fontSize: 12,
    color: 'white',
  },
});

type Layout =
    'default' // Use platform defaults (icon on Android, text on iOS)
  | 'icon' // Always use icon
  | 'title'; // Always use title

type Foreground = 'light' | 'dark';

type Item = {
  title?: string;
  icon?: ReactClass<any>;
  layout?: Layout;
  onPress?: () => void;
};

export class LeftElement extends PureComponent {
  props: {
    iconState: string,
    states: Array<Object>,
    onPress?: () => void,
  }

  static defaultProps = {
    onPress: () => {},
    // iconState: 'back',
    // states: {
    //   back: 'arrow-back',
    //   close: 'close',
    // },
  }

  constructor(props) {
    super(props);

    const icon = props.icon ||
      props.states[props.initialIcon] ||
      props.states[props.iconState];

    this.state = {
      icon,
      spin: 0,
    };

    this.spin = new Animated.Value(0);
    this.scale = new Animated.Value(1);
  }

  componentDidMount() {
    const { iconState, states } = this.props;
    if (states) {
      this.animate({ toValue: 0.5, icon: states[iconState] });
    }
  }

  componentWillReceiveProps(nextProps) {
    // // if (this.props.iconState === nextProps.iconState) return;
    const { isActive, iconState, states } = nextProps;
    // // this.spin.setValue(1);
    // this.animate({ icon: states[iconState] });
    //
    // if (isActive === 'back') {
    //
    // } else if (status === 'close')(
    //
    // )

    if (this.props.isActive === isActive) return;

    if (isActive) {
      this.animate({ toValue: 0.5, icon: states[iconState] });
    } else {
      this.animate({ toValue: 0, icon: states[iconState] });
    }
  }

  animate = ({ toValue, icon }) => {
    Animated.parallel([
      Animated.timing(this.spin, {
        toValue: 0.25,
        duration: 125,
        easing: Easing.in,
        useNativeDriver: true,
      }),
      Animated.timing(this.scale, {
        toValue: 0.1,
        duration: 125,
        easing: Easing.in,
        useNativeDriver: true,
      }),
    ])
      .start(() => {
        this.setState({ initialIcon: null, icon, spin: !this.state.spin });
        Animated.parallel([
          Animated.timing(this.spin, {
            // toValue: this.state.spin,
            toValue,
            duration: 125,
            easing: Easing.in,
            useNativeDriver: true,
          }),
          Animated.timing(this.scale, {
            toValue: 1,
            duration: 125,
            easing: Easing.in,
            useNativeDriver: true,
          }),
        ])
          .start();
      });
  }

  render() {
    const { onPress } = this.props;
    const { initialIcon, icon } = this.state;

    const scale = this.scale;
    const rotate = this.spin.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const transform = {
      transform: [
        { scale },
        { rotate },
      ],
    };

    return (
      <Animated.View style={transform}>
        <TouchableOpacity onPress={onPress}>
          <Icon
            name={icon}
            size={28}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

export class RightElement extends PureComponent {
  props: {
    iconState: string,
    states: Array<Object>,
    onPress?: () => void,
  }

  static defaultProps = {
    onPress: () => {},
  }

  constructor(props) {
    super(props);

    const icon = props.icon ||
      props.states[props.initialIcon] ||
      props.states[props.iconState];

    this.state = {
      icon,
    };

    this.scale = new Animated.Value(1);
  }

  componentDidMount() {
    const { iconState, states } = this.props;
    if (states) {
      this.animate({ icon: states[iconState] });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.iconState === nextProps.iconState) return;
    this.animate({ icon: nextProps.states[nextProps.iconState] });
  }

  animate = ({ toValue, icon }) => {
    Animated.parallel([
      Animated.timing(this.scale, {
        toValue: 0.1,
        duration: 125,
        easing: Easing.in,
        useNativeDriver: true,
      }),
    ])
      .start(() => {
        this.setState({ icon });
        Animated.parallel([
          Animated.timing(this.scale, {
            toValue: 1,
            duration: 125,
            easing: Easing.in,
            useNativeDriver: true,
          }),
        ])
          .start();
      });
  }

  render() {
    const { icon } = this.state;
    const scale = this.scale;
    const transform = {
      transform: [
        { scale },
      ],
    };

    return (
      <Animated.View style={transform}>
        <TouchableOpacity onPress={this.props.onPress}>
          <Icon
            name={icon}
            size={28}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

class ItemWrapper extends PureComponent {
  props: {
    item: Item;
    color: string;
  };

  render() {
    const { item, color } = this.props;
    if (!item) {
      return null;
    }

    let content;
    const {
      title, icon, layout, onPress,
    } = item;

    if (layout !== 'icon' && title) {
      content = (
        <Text style={[styles.itemText, { color }]}>
          {title.toUpperCase()}
        </Text>
      );
    } else if (icon) {
      content = icon;
    }

    return (
      <TouchableOpacity
        accessibilityLabel={title}
        accessibilityTraits="button"
        onPress={onPress}
        style={styles.itemWrapper}
      >
        {content}
      </TouchableOpacity>
    );
  }
}

export default class Toolbar extends PureComponent {
  static height = HEADER_HEIGHT

  static defaultProps = {
    title: null,
    leftItem: null,
    rightItem: null,
    extraItems: null,
    foreground: null,
    style: null,
    children: null,
  };

  props: {
    title?: string;
    leftItem?: Item;
    rightItem?: Item;
    extraItems?: Array<Item>;
    foreground?: Foreground;
    style?: any;
    children?: any;
  };

  render() {
    const {
      leftItem, title, rightItem, foreground,
    } = this.props;
    const titleColor = foreground === 'dark' ? '#032250' : 'white';
    const itemsColor = foreground === 'dark' ? '#7F91A7' : 'white';

    const content = (!React.Children.count(this.props.children) === 0)
      ? this.props.children
      : (
        <Text style={StyleSheet.flatten([styles.titleText, { color: titleColor }])}>
          {title}
        </Text>
      );
    return (
      <Animated.View style={StyleSheet.flatten([styles.toolbar, this.props.style])}>
        <View style={styles.leftItem}>
          <ItemWrapper color={itemsColor} item={leftItem} />
        </View>
        <View
          accessible
          accessibilityLabel={title}
          accessibilityTraits="header"
          style={styles.centerItem}
        >
          {content}
        </View>
        <View style={styles.rightItem}>
          <ItemWrapper color={itemsColor} item={rightItem} />
        </View>
      </Animated.View>
    );
  }
}
