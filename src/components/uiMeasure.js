// @flow

import { findNodeHandle } from 'react-native';
import RCTUIManager from 'NativeModules';

export default async function uiMeasure(element) {
  return new Promise((resolve, reject) => {
    try {
      const handle = findNodeHandle(element);
      RCTUIManager.UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
        resolve({
          x,
          y,
          width,
          height,
          pageX,
          pageY,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}
