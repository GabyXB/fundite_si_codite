import { moderateScale } from 'react-native-size-matters';

// Font sizes
export const fontSizes = {
  // Headings
  h1: moderateScale(32), // Pentru titluri mari (ex: ReviewsScreen rating)
  h2: moderateScale(28), // Pentru titluri principale (ex: RegisterScreen title)
  h3: moderateScale(24), // Pentru subtitluri (ex: HomeScreen section titles)
  h4: moderateScale(20), // Pentru subtitluri mai mici (ex: ProfileScreen name)
  
  // Body text
  bodyLarge: moderateScale(18), // Pentru text important
  body: moderateScale(16), // Pentru text normal (majoritatea textului)
  bodySmall: moderateScale(14), // Pentru text secundar
  caption: moderateScale(12), // Pentru text foarte mic (ex: timestamps, labels)
};

// Line heights
export const lineHeights = {
  h1: moderateScale(40),
  h2: moderateScale(36),
  h3: moderateScale(32),
  h4: moderateScale(28),
  bodyLarge: moderateScale(24),
  body: moderateScale(22),
  bodySmall: moderateScale(20),
  caption: moderateScale(16),
};

// Font weights
export const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

// Font styles
export const fontStyles = {
  // Headings
  h1: {
    fontSize: fontSizes.h1,
    lineHeight: lineHeights.h1,
    fontWeight: fontWeights.bold,
  },
  h2: {
    fontSize: fontSizes.h2,
    lineHeight: lineHeights.h2,
    fontWeight: fontWeights.bold,
  },
  h3: {
    fontSize: fontSizes.h3,
    lineHeight: lineHeights.h3,
    fontWeight: fontWeights.semiBold,
  },
  h4: {
    fontSize: fontSizes.h4,
    lineHeight: lineHeights.h4,
    fontWeight: fontWeights.semiBold,
  },

  // Body text
  bodyLarge: {
    fontSize: fontSizes.bodyLarge,
    lineHeight: lineHeights.bodyLarge,
    fontWeight: fontWeights.medium,
  },
  body: {
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    fontWeight: fontWeights.regular,
  },
  bodySmall: {
    fontSize: fontSizes.bodySmall,
    lineHeight: lineHeights.bodySmall,
    fontWeight: fontWeights.regular,
  },
  caption: {
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.caption,
    fontWeight: fontWeights.regular,
  },
};

// Helper pentru a combina stilurile
export const createTextStyle = (baseStyle, customStyle = {}) => ({
  ...baseStyle,
  ...customStyle,
}); 