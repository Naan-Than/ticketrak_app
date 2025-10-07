import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

export const FONTS = {
  Regular: 'Poppins-Regular',
  Medium: 'Poppins-Medium',
  Light: 'Poppins-Light',
  Thin: 'Poppins-Thin',
  Bold: 'Poppins-Bold',
  SemiBold: 'Poppins-SemiBold',
  AlluraRegular: 'Allura-Regular',
};

const fontConfig = {
  customFont: {
    regular: {
      fontFamily: FONTS.Regular,
    },
    medium: {
      fontFamily: FONTS.Medium,
    },
    light: {
      fontFamily: FONTS.Light,
    },
    thin: {
      fontFamily: FONTS.Thin,
    },
  },
};

// Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  roundness: 2,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#000',
    background: '#F4F5F6',
  
    accent: '#FAFAFA',
    tabs: {
      color: '#FFFFFF',
    },
    categoryTab: {
      categoryBG: '#242424',
      activeColor: '#FFFFFF',
      activePointer: 'white',
      inActiveColor: 'rgba(255, 255, 255, 0.5)',
    },
    searchBox: {
      backgroundColor: '#181818',
      iconColor: '#FFFFFF',
      textColor: '#FFFFFF',
      placeholder: '#B1B5C3',
    },
    homNodata: {
      text1Col: '#B1B5C3',
      text2Col: '#FFFFFF',
    },
    homeWatchBox: {
      genBoxBG: '#FD643A',
      text1Col: 'white',
    },
    categorySubTab: {
      activeColor: '#242424',
      textColor: '#000000',
    },
    HomeHeader: {
      allTextColor: '#FD643A',
    },
    SearchResultBox: {
      text1Col: '#ffffff',
      text2Col: '#777E90',
    },
    MyModal: {
      headerBG: 'white',
      headerImageBG: '#E6E8EC',
      bodyCol: MD3DarkTheme.colors.background,
    },
    ExploreButton: {
      bgColor: '#FD643A',
      textColor: '#FFFFFF',
    },
    DetailsBottomBar: {
      bgColor: '#000000',
      iconColor: '#b6b6b6',
    },
    WibelyCard: {
      TopiconColor: '#000000',
      bodyBg: '#FFFFFF',
      avaTextColor: '#484848',
    },
    SkeletonContent: {
      color: '#C0C0C0',
    },
  },
};

// Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  roundness: 2,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#000',
    background: '#F4F5F6',
    accent: '#1A1A1A',
    tabs: {
      color: '#000000',
    },
    categoryTab: {
      categoryBG: '#000000',
      activeColor: '#FFFFFF',
      activePointer: '#000000',
      inActiveColor: 'rgba(255, 255, 255, 0.5)',
    },
    searchBox: {
      backgroundColor: '#F4F5F6',
      iconColor: '#000000',
      textColor: '#000000',
      placeholder: '#B1B5C3',
    },
    homNodata: {
      text1Col: '#B1B5C3',
      text2Col: '#000000',
    },
    homeWatchBox: {
      genBoxBG: '#FD643A',
      text1Col: 'white',
    },
    categorySubTab: {
      activeColor: '#F4F5F6',
      textColor: '#000000',
    },
    HomeHeader: {
      allTextColor: '#FD643A',
    },
    SearchResultBox: {
      text1Col: '#000000',
      text2Col: '#777E90',
    },
    MyModal: {
      headerBG: 'white',
      headerImageBG: '#E6E8EC',
      bodyCol: '#FFFFFF',
    },
    ExploreButton: {
      bgColor: '#FD643A',
      textColor: '#FFFFFF',
    },
    DetailsBottomBar: {
      bgColor: '#000000',
      iconColor: '#b6b6b6',
    },
    WibelyCard: {
      TopiconColor: '#000000',
      bodyBg: '#FFFFFF',
      avaTextColor: '#484848',
    },
    SkeletonContent: {
      color: '#C0C0C0',
    },
  },
};

// Theme Switcher
export const ColorScheme = (colorScheme: string) =>
  // colorScheme === 'dark' ? darkTheme : lightTheme;
  colorScheme === 'dark' ? lightTheme : lightTheme;

