/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'SF Pro Text',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'SF Pro Text',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'SF Pro Rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'SF Pro Mono',
  },
  default: {
    sans: 'SF Pro Text',
    serif: 'SF Pro Text',
    rounded: 'SF Pro Rounded',
    mono: 'SF Pro Mono',
  },
  web: {
    sans: "'SF Pro Text', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    serif: "'SF Pro Text', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    rounded: "'SF Pro Rounded', 'SF Pro Text', system-ui, sans-serif",
    mono: "'SF Pro Mono', SFMono-Regular, Menlo, Monaco, monospace",
  },
});
