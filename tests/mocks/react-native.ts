export const Platform = {
  OS: "android",
  select: (obj: any) => obj.android ?? obj.default,
};

export const StyleSheet = {
  create: (styles: any) => styles,
  hairlineWidth: 1,
  absoluteFillObject: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
};

export const Dimensions = {
  get: () => ({ width: 412, height: 915, scale: 2.6, fontScale: 1 }),
  addEventListener: () => ({ remove: () => {} }),
};

export const AppState = {
  currentState: "active",
  addEventListener: () => ({ remove: () => {} }),
};

export const I18nManager = {
  isRTL: true,
  allowRTL: () => {},
  forceRTL: () => {},
};

export const BackHandler = {
  addEventListener: () => ({ remove: () => {} }),
};

export default {
  Platform,
  StyleSheet,
  Dimensions,
  AppState,
  I18nManager,
  BackHandler,
};
